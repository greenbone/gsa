/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  isValidFeedKeyExtension,
  validateFeedKeyFile,
} from 'web/utils/feed-key-validation';

describe('Feed Key Validation', () => {
  describe('isValidFeedKeyExtension', () => {
    test('should accept .pem extension', () => {
      expect(isValidFeedKeyExtension('key.pem')).toBe(true);
      expect(isValidFeedKeyExtension('my-key.pem')).toBe(true);
      expect(isValidFeedKeyExtension('KEY.PEM')).toBe(true);
    });

    test('should accept .key extension', () => {
      expect(isValidFeedKeyExtension('key.key')).toBe(true);
      expect(isValidFeedKeyExtension('my-key.key')).toBe(true);
      expect(isValidFeedKeyExtension('KEY.KEY')).toBe(true);
    });

    test('should reject other extensions', () => {
      expect(isValidFeedKeyExtension('key.txt')).toBe(false);
      expect(isValidFeedKeyExtension('key.pub')).toBe(false);
      expect(isValidFeedKeyExtension('key')).toBe(false);
      expect(isValidFeedKeyExtension('key.cer')).toBe(false);
    });
  });

  describe('validateFeedKeyFile', () => {
    test('should reject file with invalid extension', async () => {
      const file = new File(['content'], 'test.txt', {type: 'text/plain'});
      const result = await validateFeedKeyFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file extension');
    });

    test('should reject content that is too short', async () => {
      const shortContent = 'abc123';
      const file = new File([shortContent], 'test.pem', {
        type: 'application/x-pem-file',
      });
      file.text = () => Promise.resolve(shortContent);
      const result = await validateFeedKeyFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too small');
    });

    test('should reject content with invalid characters', async () => {
      const invalidContent = '!@#$%^&*()'.repeat(20);
      const file = new File([invalidContent], 'test.pem', {
        type: 'application/x-pem-file',
      });
      file.text = () => Promise.resolve(invalidContent);
      const result = await validateFeedKeyFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not appear to be a valid key file');
    });

    test('should accept valid base64 content', async () => {
      const validBase64 =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=='.repeat(
          3,
        );
      const file = new File([validBase64], 'test.pem', {
        type: 'application/x-pem-file',
      });
      file.text = () => Promise.resolve(validBase64);
      const result = await validateFeedKeyFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept valid PEM content', async () => {
      const validPem =
        '-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIEpAIBAAKCAQEA1234567890abcdef'.repeat(5) +
        '\n-----END RSA PRIVATE KEY-----\n';
      const file = new File([validPem], 'test.key', {
        type: 'application/octet-stream',
      });
      file.text = () => Promise.resolve(validPem);
      const result = await validateFeedKeyFile(file);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should handle whitespace in content', async () => {
      const validContent =
        '  ' +
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=='.repeat(
          3,
        ) +
        '  \n';
      const file = new File([validContent], 'test.pem', {
        type: 'application/x-pem-file',
      });
      file.text = () => Promise.resolve(validContent);
      const result = await validateFeedKeyFile(file);
      expect(result.isValid).toBe(true);
    });
  });
});
