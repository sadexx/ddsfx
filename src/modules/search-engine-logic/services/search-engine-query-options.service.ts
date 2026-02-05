import { Injectable } from '@nestjs/common';
import { QueryContainer } from '@opensearch-project/opensearch/api/_types/_common.query_dsl.js';
import { Search_Request } from '@opensearch-project/opensearch/api/index.js';
import { EOpenSearchIndexType, EOpenSearchSortOrder } from 'src/libs/opensearch/common/enums';
import { SearchQueryDto } from 'src/modules/search-engine-logic/common/dto';

@Injectable()
export class SearchEngineQueryOptionsService {
  private readonly FUZZY_MIN_LENGTH = 4;
  private readonly FUZZY_THRESHOLD_SHORT = 4;
  private readonly FUZZY_THRESHOLD_MEDIUM = 7;
  private readonly FUZZINESS_DISABLED = 0;
  private readonly FUZZINESS_LOW = 1;
  private readonly FUZZINESS_MEDIUM = 2;

  /**
   * Builds search options for a given query (minimum 3 characters), using tiered strategies:
   *   1. Exact keyword matches (highest relevance)
   *   2. N-gram substring matching (partial matches anywhere in text)
   *   3. Standard text matching (tokenized full-text search)
   *   4. Fuzzy matching (typo tolerance for queries ≥4 chars)
   *
   * @param query - The search query (validated to be 3-100 characters)
   * @returns Search_Request - OpenSearch request configuration
   */
  public buildSearchPeopleOptions(dto: SearchQueryDto): Search_Request {
    const normalizedQuery = dto.query.trim().toLowerCase();
    const queryLength = normalizedQuery.length;

    const shouldClauses = this.buildSearchClauses(normalizedQuery, queryLength);
    const filterClauses = this.buildFilterClauses(dto);

    const page = dto.page;
    const pageSize = dto.pageSize;
    const from = (page - 1) * pageSize;

    return {
      index: EOpenSearchIndexType.PEOPLE,
      body: {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: shouldClauses,
                  minimum_should_match: 1,
                },
              },
            ],
            ...(filterClauses.length > 0 && { filter: filterClauses }),
          },
        },
        from: from,
        size: pageSize,
        sort: [
          '_score',
          { 'lastName.keyword': { order: EOpenSearchSortOrder.ASC, missing: '_last' } },
          { 'firstName.keyword': { order: EOpenSearchSortOrder.ASC, missing: '_last' } },
        ],
      },
    };
  }

  /**
   * Strategy 1: Exact keyword matches (case-insensitive via normalizer) 3 clauses
   * Best for: Exact name matches
   * Highest boost: 10-9 points
   *
   * Strategy 2: N-gram substring matching 4 clauses
   * Best for: Partial matches
   * Medium-high boost: 6-4 points
   *
   * Strategy 3: Standard tokenized text matching 4 clauses
   * Best for: Multi-word queries or word-boundary matching
   * Medium boost: 3.5-2.5 points
   *
   * Strategy 4: Fuzzy matching for typo tolerance (3 clauses)
   * Best for: Misspellings
   * Low boost: 2-1.5 points
   * Only applied for queries ≥4 characters to avoid noise
   */
  private buildSearchClauses(normalizedQuery: string, queryLength: number): QueryContainer[] {
    const shouldClauses: QueryContainer[] = [
      // Strategy 1: Exact matches
      { term: { 'firstName.keyword': { value: normalizedQuery, boost: 10 } } },
      { term: { 'lastName.keyword': { value: normalizedQuery, boost: 10 } } },
      { term: { 'middleName.keyword': { value: normalizedQuery, boost: 9 } } },

      // Strategy 2: N-gram matches
      { match: { 'firstName.ngram': { query: normalizedQuery, boost: 5 } } },
      { match: { 'lastName.ngram': { query: normalizedQuery, boost: 5 } } },
      { match: { 'middleName.ngram': { query: normalizedQuery, boost: 4 } } },
      { match: { 'fullName.ngram': { query: normalizedQuery, boost: 6 } } },

      // Strategy 3: Standard text
      { match: { firstName: { query: normalizedQuery, boost: 3 } } },
      { match: { lastName: { query: normalizedQuery, boost: 3 } } },
      { match: { middleName: { query: normalizedQuery, boost: 2.5 } } },
      { match: { fullName: { query: normalizedQuery, boost: 3.5 } } },
    ];

    // Strategy 4: Fuzzy
    if (queryLength >= this.FUZZY_MIN_LENGTH) {
      const fuzziness = this.calculateFuzziness(queryLength);

      shouldClauses.push(
        { fuzzy: { 'firstName.keyword': { value: normalizedQuery, fuzziness, boost: 2 } } },
        { fuzzy: { 'lastName.keyword': { value: normalizedQuery, fuzziness, boost: 2 } } },
        { fuzzy: { 'middleName.keyword': { value: normalizedQuery, fuzziness, boost: 1.5 } } },
      );
    }

    return shouldClauses;
  }

  /**
   * Builds filter clauses for optional parameters.
   * Filters are applied in filter context (cached, don't affect scoring).
   *
   * @param dto - Search query DTO with optional filters
   * @returns Array of filter clauses
   */
  private buildFilterClauses(dto: SearchQueryDto): QueryContainer[] {
    const filters: QueryContainer[] = [];

    if (dto.cemeteryName) {
      filters.push({
        term: { cemeteryName: { value: dto.cemeteryName.trim().toLowerCase() } },
      });
    }

    if (dto.birthDay !== undefined) {
      filters.push({ term: { birthDay: dto.birthDay } });
    }

    if (dto.birthMonth !== undefined) {
      filters.push({ term: { birthMonth: dto.birthMonth } });
    }

    if (dto.birthYear !== undefined) {
      filters.push({ term: { birthYear: dto.birthYear } });
    }

    if (dto.deathDay !== undefined) {
      filters.push({ term: { deathDay: dto.deathDay } });
    }

    if (dto.deathMonth !== undefined) {
      filters.push({ term: { deathMonth: dto.deathMonth } });
    }

    if (dto.deathYear !== undefined) {
      filters.push({ term: { deathYear: dto.deathYear } });
    }

    return filters;
  }

  /**
   * Calculates adaptive fuzziness based on query length
   * - 3 chars: 0 edits (fuzzy disabled via early return in buildFuzzyClauses)
   * - 4-7 chars: 1 edit allowed (handles single typos)
   * - 8+ chars: 2 edits allowed (handles multiple typos)
   */
  private calculateFuzziness(queryLength: number): number {
    if (queryLength <= this.FUZZY_THRESHOLD_SHORT) {
      return this.FUZZINESS_DISABLED;
    }

    if (queryLength <= this.FUZZY_THRESHOLD_MEDIUM) {
      return this.FUZZINESS_LOW;
    }

    return this.FUZZINESS_MEDIUM;
  }
}
