/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {Components, Operations} from 'gmp/commands/feed-key-types';

import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';

export type KeyResponse = Components['schemas']['JsonResponse'];

type GetKeyResponse =
  Operations['download_key']['responses']['200']['content']['application/octet-stream'];
type DeleteKeyResponse =
  Operations['delete_key']['responses']['200']['content']['application/json'];
type UploadKeyResponse =
  Operations['upload_key_multipart']['responses']['200']['content']['application/json'];

const log = logger.getLogger('gmp.commands.feedKey');

const API_BASE_URL = 'http://127.0.0.1:9392/service/feed-key/api/v1';
const AUTH_TOKEN =
  'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxODA0ODYyNDQ1LCJpYXQiOjE3NzMzMjY0NDV9.XodFlXW17yGhdwaZ1KGQD77HusTlWPnjrtKwei0Y_eQ';

class FeedKeyCommand extends HttpCommand {
  constructor(http: Http) {
    super(http);
  }

  /**
   * Get the feed key
   * @returns Promise resolving to the key content as a string (PEM format)
   * @throws Error if no key is found (404) or request fails
   */
  async get(): Promise<GetKeyResponse> {
    log.debug('Getting feed key');

    const token = AUTH_TOKEN;
    const response = await fetch(`${API_BASE_URL}/key`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No key found');
      }
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.text();
  }

  /**
   * Delete the feed key
   * @returns Promise resolving to the response with status and message
   * @throws Error if the deletion fails
   */
  async delete(): Promise<DeleteKeyResponse> {
    log.debug('Deleting feed key');

    const token = AUTH_TOKEN;
    const response = await fetch(`${API_BASE_URL}/key`, {
      method: 'DELETE',
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Key deletion failed');
    }

    return response.json();
  }

  /**
   * Save (upload) a feed key
   * @param file - The file to save
   * @returns Promise resolving to the response with status and message
   * @throws Error if the save fails
   */
  async save(file: File): Promise<UploadKeyResponse> {
    log.debug('Saving feed key', {fileName: file.name});

    const formData = new FormData();
    formData.append('file', file);

    const token = AUTH_TOKEN;
    const response = await fetch(`${API_BASE_URL}/key`, {
      method: 'POST',
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Key save failed');
    }

    return response.json();
  }
}

export default FeedKeyCommand;
