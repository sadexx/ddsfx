import { IncomingHttpHeaders } from 'http';
import { BadRequestException } from '@nestjs/common';

/**
 * Extracts the client IP address from the given HTTP headers.
 * It checks for the 'x-forwarded-for' and 'x-real-ip' headers and
 * returns the first IP address found.
 *
 * Priority: x-forwarded-for > x-real-ip
 *
 * If no IP address is found, it throws a BadRequestException.
 *
 * @param headers The HTTP headers to extract the client IP address from.
 * @returns The extracted client IP address.
 */

export function extractClientIp(headers: IncomingHttpHeaders): string {
  const xForwardedFor = headers['x-forwarded-for'];
  const xRealIp = headers['x-real-ip'];

  let clientIp: string | undefined;

  if (xForwardedFor) {
    clientIp = Array.isArray(xForwardedFor) ? xForwardedFor[0]?.trim() : xForwardedFor.split(',')[0]?.trim();
  }

  if (!clientIp && xRealIp) {
    clientIp = Array.isArray(xRealIp) ? xRealIp[0]?.trim() : typeof xRealIp === 'string' ? xRealIp.trim() : undefined;
  }

  if (!clientIp || clientIp === '') {
    throw new BadRequestException('Client IP address could not be determined');
  }

  return clientIp;
}
