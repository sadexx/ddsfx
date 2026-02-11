import { Property } from '@opensearch-project/opensearch/api/_types/_common.mapping.js';

export class OpenSearchMappings {
  static keyword(): Property {
    return { type: 'keyword', normalizer: 'lowercase_normalizer' };
  }

  static float(): Property {
    return { type: 'float' };
  }

  static integer(): Property {
    return { type: 'integer' };
  }

  static boolean(): Property {
    return { type: 'boolean' };
  }

  static date(): Property {
    return { type: 'date' };
  }

  static textWithNgram(): Property {
    return {
      type: 'text',
      analyzer: 'cyrillic_analyzer',
      fields: {
        keyword: this.keyword(),
        ngram: {
          type: 'text',
          analyzer: 'name_ngram_analyzer',
          search_analyzer: 'name_search_analyzer',
        },
      },
    };
  }

  static textFullName(): Property {
    return {
      type: 'text',
      analyzer: 'cyrillic_analyzer',
      fields: {
        ngram: {
          type: 'text',
          analyzer: 'name_ngram_analyzer',
          search_analyzer: 'name_search_analyzer',
        },
      },
    };
  }

  static nested(properties: Record<string, Property>): Property {
    return { type: 'nested', properties };
  }
}
