import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Options as AjvOptions } from '@fastify/ajv-compiler';
import { FastifyListenOptions, FastifyServerOptions } from 'fastify';
import type { FastifyCorsOptions } from '@fastify/cors';
import { formatFastifySchemaErrors } from 'src/config/fastify';
import { MAX_FILE_SIZE_LIMIT, IS_LOCAL, MAX_ALLOWED_FILES, NUMBER_BYTES_IN_MEGABYTE } from 'src/common/constants';
import { FastifyStaticOptions } from '@fastify/static';
import { join } from 'path';
import { FastifyCookieOptions } from '@fastify/cookie';
import { FastifyMultipartBaseOptions } from '@fastify/multipart';

/**
 ** AJV Custom Options
 * @see link https://github.com/ajv-validator/ajv/tree/v6#options
 * @see coerceTypes-link https://ajv.js.org/coercion.html#type-coercion-rules
 */

const getAjvOptions = (): Partial<AjvOptions> => {
  return {
    //? === STRICT VALIDATION ===
    strict: false,
    strictSchema: IS_LOCAL ? 'log' : false,
    strictNumbers: true,
    strictTypes: true,
    strictTuples: true,
    strictRequired: true,

    //? === VALIDATION BEHAVIOR ===
    allowMatchingProperties: false,
    allowUnionTypes: true,
    validateFormats: true,
    allErrors: IS_LOCAL,
    verbose: IS_LOCAL,

    //? === DATA TRANSFORMATION ===
    removeAdditional: 'all',
    useDefaults: true,
    coerceTypes: true,

    //? === PERFORMANCE ===
    unicodeRegExp: false,
    inlineRefs: true,
    unicode: true,

    //? === SECURITY ===
    $data: false,

    //? === SCHEMA MANAGEMENT ===
    validateSchema: IS_LOCAL ? 'log' : false,
    addUsedSchema: true,
    schemaId: '$id',
    formats: {},
    schemas: {},

    //? === ADVANCED FEATURES ===
    discriminator: true,
    unevaluated: true,
    ownProperties: true,
    meta: true,
    passContext: false,

    //? === ERROR HANDLING ===
    messages: true,
    logger: false,
  };
};

/**
 ** Fastify Server Options
 * @see link https://fastify.dev/docs/latest/Reference/Server/#factory
 */

const getFastifyServerOptions = (): Partial<FastifyServerOptions> => {
  return {
    //? === SERVER FACTORY ===
    connectionTimeout: 0,
    keepAliveTimeout: 72000,
    forceCloseConnections: 'idle',
    maxRequestsPerSocket: 0,
    requestTimeout: 0,
    bodyLimit: NUMBER_BYTES_IN_MEGABYTE * 1,
    onProtoPoisoning: 'error',
    onConstructorPoisoning: 'error',
    logger: false,
    disableRequestLogging: false,
    requestIdHeader: 'request-id',
    requestIdLogLabel: 'reqId',
    trustProxy: true,
    pluginTimeout: 10000,
    exposeHeadRoutes: true,
    return503OnClosing: true,
    ajv: { customOptions: getAjvOptions() },
    allowErrorHandlerOverride: false,

    //? === ROUTER OPTIONS ===
    routerOptions: {
      allowUnsafeRegex: false,
      caseSensitive: true,
      ignoreDuplicateSlashes: false,
      ignoreTrailingSlash: false,
      maxParamLength: 100,
      useSemicolonDelimiter: false,
    },

    //? === CUSTOM SCHEMA ERROR FORMATTING ===
    schemaErrorFormatter: formatFastifySchemaErrors,
  };
};

/**
 ** Fastify Listen Options
 * @see link https://www.fastify.dev/docs/latest/Reference/Server/#listen
 */

export const fastifyListenOptions = (): FastifyListenOptions => {
  return {
    host: '0.0.0.0',
    backlog: 511,
    exclusive: false,
    readableAll: false,
    writableAll: false,
    ipv6Only: false,
  };
};

/**
 ** Fastify CORS Options
 * @see link https://github.com/fastify/fastify-cors?tab=readme-ov-file#options
 */

export const fastifyCorsOptions = (): FastifyCorsOptions => {
  return {
    credentials: true,
    origin: true,
    methods: ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    exposedHeaders: ['ETag'],
    preflightContinue: false,
    preflight: true,
    strictPreflight: true,
    hideOptionsRoute: true,
  };
};

/**
 ** Fastify Static Options
 * @see link https://github.com/fastify/fastify-static?tab=readme-ov-file#options
 */

export const fastifyStaticOptions = (): FastifyStaticOptions => {
  return {
    root: join(process.cwd(), 'dist/src/modules/deep-link/common'),
    prefix: '/',
    prefixAvoidTrailingSlash: false,
    decorateReply: false,
    schemaHide: true,
    setHeaders: undefined,
    redirect: false,
    wildcard: true,
    globIgnore: undefined,
    list: undefined,
    preCompressed: false,
    acceptRanges: true,
    contentType: true,
    cacheControl: true,
    dotfiles: 'allow',
    etag: true,
    immutable: false,
    index: undefined,
    serveDotFiles: false,
    lastModified: true,
    maxAge: 0,
    constraints: {},
    logLevel: 'info',
  };
};

/**
 ** Fastify Cookie Options
 * @see link https://github.com/fastify/fastify-cookie?tab=readme-ov-file#options
 */
export const fastifyCookieOptions = (): FastifyCookieOptions => {
  return {
    hook: 'onRequest',
    parseOptions: {
      path: '/',
      httpOnly: true,
      secure: 'auto',
      sameSite: 'lax',
    },
  };
};

/**
 ** Create and configure Fastify Multipart Options
 * @see link https://github.com/fastify/fastify-multipart?tab=readme-ov-file#usage
 */

export const fastifyMultipartOptions = (): FastifyMultipartBaseOptions => {
  return {
    throwFileSizeLimit: true,
    limits: {
      fieldNameSize: 0,
      fieldSize: 0,
      fields: 0,
      fileSize: MAX_FILE_SIZE_LIMIT,
      files: MAX_ALLOWED_FILES,
      headerPairs: 20,
      parts: 1000,
    },
  };
};

/**
 ** Create and configure FastifyAdapter
 */

export function createFastifyAdapter(): FastifyAdapter {
  const adapter = new FastifyAdapter({
    ...getFastifyServerOptions(),
  });

  return adapter;
}
