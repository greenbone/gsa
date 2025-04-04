/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import HttpCommand from 'gmp/commands/http';
import date, {duration} from 'gmp/models/date';
import {parseDate} from 'gmp/parser';
import {map} from 'gmp/utils/array';

export const NVT_FEED = 'NVT';
export const CERT_FEED = 'CERT';
export const SCAP_FEED = 'SCAP';
export const GVMD_DATA_FEED = 'GVMD_DATA';

export const FEED_COMMUNITY = 'Greenbone Community Feed';

const convertVersion = version =>
  `${version}`.slice(0, 8) + 'T' + `${version}`.slice(8, 12);

export function createFeed(feed) {
  const versionDate = convertVersion(feed.version);
  const lastUpdate = parseDate(versionDate);

  return {
    feedType: feed.type,
    name: feed.name,
    description: feed.description,
    status: feed.status,
    currentlySyncing: feed.currently_syncing,
    syncNotAvailable: feed.sync_not_available,
    version: versionDate,
    age: duration(date().diff(lastUpdate)),
  };
}

export class FeedStatus extends HttpCommand {
  constructor(http) {
    super(http, {cmd: 'get_feeds'});
  }

  readFeedInformation() {
    return this.httpGet().then(response => {
      const {data: envelope} = response;
      const {get_feeds_response: feedsResponse} = envelope.get_feeds;

      const feeds = map(feedsResponse.feed, feed => createFeed(feed));

      return response.setData(feeds);
    });
  }

  /**
   * Checks if any feed is currently syncing or if required feeds are not present.
   *
   * @returns {Promise<{isSyncing: boolean string}>} - A promise that resolves to an object indicating if any feed is syncing or if required feeds are not present or if there was an error.
   * @throws {Error} - Throws an error if there is an issue fetching feed information.
   */

  async checkFeedSync() {
    try {
      const response = await this.readFeedInformation();

      const isFeedSyncing = response.data.some(
        feed => feed.currentlySyncing || feed.syncNotAvailable,
      );

      const isNotPresent =
        !response.data.some(feed => feed.feedType === NVT_FEED) ||
        !response.data.some(feed => feed.feedType === SCAP_FEED);

      return {
        isSyncing: isFeedSyncing || isNotPresent,
      };
    } catch (error) {
      console.error('Error checking if feed is syncing:', error);
      throw error;
    }
  }

  /**
   * Checks if the current user is the owner of the feed and if they have access to feed resources.
   *
   * @async
   * @function checkFeedOwnerAndPermissions
   * @returns {Promise<Object>} An object containing two boolean properties:
   * - `isFeedOwner`: Indicates if the user is the owner of the feed.
   * - `isFeedResourcesAccess`: Indicates if the user has access to feed resources.
   * @throws Will throw an error if the HTTP request fails.
   */
  async checkFeedOwnerAndPermissions() {
    try {
      const {
        data: {
          get_feeds: {
            get_feeds_response: {
              feed_owner_set: feedOwner,
              feed_resources_access: feedResourcesAccess,
            },
          },
        },
      } = await this.httpGet();

      const feedOwnerBoolean = Boolean(feedOwner);
      const feedResourcesAccessBoolean = Boolean(feedResourcesAccess);

      return {
        isFeedOwner: feedOwnerBoolean,
        isFeedResourcesAccess: feedResourcesAccessBoolean,
      };
    } catch (error) {
      console.error('Error checking feed owner and permissions:', error);
      throw error;
    }
  }

  async isCommunityFeed() {
    try {
      const {data} = await this.readFeedInformation();

      const nvtFeed = data.find(feed => feed.feedType === NVT_FEED);

      return nvtFeed && nvtFeed.name === FEED_COMMUNITY;
    } catch (error) {
      console.error('Error checking if feed is community:', error);
    }
  }
}

registerCommand('feedstatus', FeedStatus);
