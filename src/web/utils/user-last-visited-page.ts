/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const STORAGE_KEY_PREFIX = 'gsa_last_visited_page_';

/**
 * Save the last visited page for a specific user in sessionStorage
 * @param username - The username to store the page for
 * @param path - The full path (pathname + search) to save
 */
export const saveLastVisitedPage = (username: string, path: string): void => {
  if (!username || !path) {
    return;
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${username}`;
    sessionStorage.setItem(storageKey, path);
  } catch (error) {
    console.error('Failed to save last visited page:', error);
  }
};

/**
 * Get the last visited page for a specific user from sessionStorage
 * @param username - The username to retrieve the page for
 * @returns The last visited path or undefined if not found
 */
export const getLastVisitedPage = (username: string): string | undefined => {
  if (!username) {
    return undefined;
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${username}`;
    return sessionStorage.getItem(storageKey) ?? undefined;
  } catch (error) {
    console.error('Failed to get last visited page:', error);
    return undefined;
  }
};

/**
 * Clear the last visited page for a specific user from sessionStorage
 * @param username - The username to clear the page for
 */
export const clearLastVisitedPage = (username: string): void => {
  if (!username) {
    return;
  }

  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${username}`;
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear last visited page:', error);
  }
};
