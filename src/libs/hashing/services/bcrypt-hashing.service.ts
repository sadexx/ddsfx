import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { ENV_CONFIG_TOKEN } from 'src/config/common/constants';
import { EnvConfig } from 'src/config/common/types';

@Injectable()
export class BcryptHashingService {
  private readonly SALT_ROUNDS: number;

  constructor(private readonly configService: ConfigService) {
    const { BCRYPT_SALT_ROUNDS } = this.configService.getOrThrow<EnvConfig>(ENV_CONFIG_TOKEN);
    this.SALT_ROUNDS = BCRYPT_SALT_ROUNDS;
  }

  /**
   * Hashes a given plain text string using bcrypt.
   * @param plainText The string to hash.
   * @returns A promise that resolves to the hashed string.
   */
  public async hash(plainText: string): Promise<string> {
    return await hash(plainText, this.SALT_ROUNDS);
  }

  /**
   * Compares a given plain text string against a hashed string using bcrypt.
   * @param plainText The string to compare.
   * @param hashedValue The hashed string to compare against.
   * @returns A promise that resolves to a boolean indicating whether the plain text string matches the hashed string.
   */
  public async compare(plainText: string, hashedValue: string): Promise<boolean> {
    return await compare(plainText, hashedValue);
  }
}
