/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {Components, Operations} from 'gmp/commands/feed-key-types';

import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {buildServerUrl} from 'gmp/http/utils';
import logger from 'gmp/log';
import type Settings from 'gmp/settings';

export type KeyResponse =
  Operations['download_key']['responses']['200']['content']['application/octet-stream'];

export interface KeyStatusResponse {
  hasKey: boolean;
}

export type DeleteKeyResponse =
  Operations['delete_key']['responses']['200']['content']['application/json'];
export type UploadKeyResponse =
  Operations['upload_key_multipart']['responses']['200']['content']['application/json'];

const log = logger.getLogger('gmp.commands.feedKey');

const API_BASE_PATH = 'service/feed-key/api/v1';

class FeedKeyCommand extends HttpCommand {
  private readonly settings: Settings;
  private readonly baseUrl: string;
  private readonly renewSessionFn?: () => Promise<void>;

  constructor(
    http: Http,
    settings: Settings,
    renewSessionFn?: () => Promise<void>,
  ) {
    super(http);
    this.settings = settings;
    this.renewSessionFn = renewSessionFn;
    if (this.settings.apiServer) {
      this.baseUrl = buildServerUrl(
        this.settings.apiServer,
        API_BASE_PATH,
        this.settings.apiProtocol,
      );
    } else {
      this.baseUrl = `/${API_BASE_PATH}`;
    }
  }

  private async ensureSession(): Promise<void> {
    if (this.renewSessionFn) {
      await this.renewSessionFn();
    }
  }

  private getAuthHeaders(): HeadersInit {
    const {jwt} = this.settings;
    if (!jwt) {
      throw new Error('Not authenticated, JWT is missing');
    }

    return {
      Authorization: `Bearer ${jwt}`,
    };
  }

  private async getErrorMessage(
    response: Response,
    fallback: string,
  ): Promise<string> {
    if (typeof response.text !== 'function') {
      try {
        const data = await response.json();
        return data?.message || fallback;
      } catch {
        return fallback;
      }
    }

    const text = await response.text();

    if (!text) {
      return fallback;
    }

    try {
      const data = JSON.parse(text) as Components['schemas']['JsonResponse'];
      return data.message || fallback;
    } catch {
      return text;
    }
  }

  /**
   * Get the feed key status
   * @returns Promise resolving to {hasKey: boolean}
   * @throws Error if the request fails
   */
  async getStatus(): Promise<KeyStatusResponse> {
    await this.ensureSession();
    log.debug('Getting feed key status');

    const response = await fetch(`${this.baseUrl}/key/status`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) {
      return {hasKey: false};
    }

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response,
          `Request failed: ${response.status}`,
        ),
      );
    }

    return response.json() as Promise<KeyStatusResponse>;
  }

  /**
   * Get the feed key
   * @returns Promise resolving to the key response data
   * @throws Error if the request fails
   */
  async get(): Promise<KeyResponse> {
    await this.ensureSession();
    log.debug('Getting feed key');

    const response = await fetch(`${this.baseUrl}/key`, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 404) {
      return '';
    }

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(
          response,
          `Request failed: ${response.status}`,
        ),
      );
    }

    try {
      return await response.json();
    } catch {
      return response.text();
    }
  }

  /**
   * Delete the feed key
   * @returns Promise resolving to the response with status and message
   * @throws Error if the deletion fails
   */
  async delete(): Promise<DeleteKeyResponse> {
    await this.ensureSession();
    log.debug('Deleting feed key');

    const response = await fetch(`${this.baseUrl}/key`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        await this.getErrorMessage(response, 'Key deletion failed'),
      );
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
    await this.ensureSession();
    log.debug('Saving feed key', {fileName: file.name});

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/key`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response, 'Key save failed'));
    }

    return response.json();
  }
}

export default FeedKeyCommand;
