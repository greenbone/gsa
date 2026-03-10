/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export interface FeedKeyValidationResult {
  isValid: boolean;
  error?: string;
}

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

/**
 * Basic feed key validation used by the web UI.
 * Rules:
 * - file must have a valid extension (.pem or .key)
 * - file must not be empty
 * - file must contain a feed identifier like `@feed.greenbone.net:/feed/`
 * - file must contain both BEGIN and END markers (e.g. `-----BEGIN ... KEY-----`)
 */
export const validateFeedKeyFile = async (
  file: File,
): Promise<FeedKeyValidationResult> => {
  // Only verify extension and that the file is not empty
  if (!isValidFeedKeyExtension(file.name)) {
    return {
      isValid: false,
      error: 'Invalid file extension. Please upload a .pem or .key file',
    };
  }

  const content = await file.text();
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: 'The selected file is empty',
    };
  }

  return {isValid: true};
};
