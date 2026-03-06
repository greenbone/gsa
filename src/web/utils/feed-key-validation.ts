/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isString} from 'gmp/utils/identity';

export interface FeedKeyValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a file's content against basic criteria
 * Similar to credential file validation pattern
 */
const validateFileContent = async (
  file: File,
  pattern: string | RegExp,
  minLength: number,
  errorMessage: string,
): Promise<void> => {
  const content = await file.text();

  if (!isString(content)) {
    throw new Error(errorMessage);
  }

  if (content.trim().length < minLength) {
    throw new Error(
      'The selected file appears to be too small to be a valid feed key. Please select the correct feed key file.',
    );
  }

  if (isString(pattern) && !content.startsWith(pattern)) {
    throw new Error(errorMessage);
  }

  if (pattern instanceof RegExp && !pattern.test(content)) {
    throw new Error(errorMessage);
  }
};

/**
 * Validates the file extension for a feed key file
 * @param fileName - The name of the file
 * @returns true if the extension is valid, false otherwise
 */
export const isValidFeedKeyExtension = (fileName: string): boolean => {
  const validExtensions = ['.pem', '.key'];
  const lowerFileName = fileName.toLowerCase();
  return validExtensions.some(ext => lowerFileName.endsWith(ext));
};

// Pattern to match base64 or PEM content
const FEED_KEY_PATTERN = /^[A-Za-z0-9+/=\s-]+$/;
const MIN_KEY_LENGTH = 100;

/**
 * Reads a file and validates its content as a feed key
 * @param file - The File object to validate
 * @returns Promise that resolves to validation result
 */
export const validateFeedKeyFile = async (
  file: File,
): Promise<FeedKeyValidationResult> => {
  // First check the file extension
  if (!isValidFeedKeyExtension(file.name)) {
    return {
      isValid: false,
      error: 'Invalid file extension. Please upload a .pem or .key file',
    };
  }

  // Validate file content
  try {
    await validateFileContent(
      file,
      FEED_KEY_PATTERN,
      MIN_KEY_LENGTH,
      'The selected file does not appear to be a valid key file. Please select the correct feed key file provided by Greenbone.',
    );
    return {
      isValid: true,
    };
  } catch (error) {
    return {
      isValid: false,
      error: (error as Error).message,
    };
  }
};
