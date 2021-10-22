/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import registerCommand from 'gmp/command';

import {parseDate} from 'gmp/parser';

import {map} from 'gmp/utils/array';

import date, {duration} from 'gmp/models/date';

import HttpCommand from './http';

const convertVersion = version =>
  `${version}`.slice(0, 8) + 'T' + `${version}`.slice(8, 12);

export const NVT_FEED = 'NVT';
export const CERT_FEED = 'CERT';
export const SCAP_FEED = 'SCAP';
export const GVMD_DATA_FEED = 'GVMD_DATA';

export class Feed {
  constructor({type, name, description, status, version, currently_syncing}) {
    this.feed_type = type;
    this.name = name;
    this.description = description;
    this.status = status;
    this.currentlySyncing = currently_syncing;

    const versionDate = convertVersion(version);
    this.version = versionDate;

    const lastUpdate = parseDate(versionDate);
    this.age = duration(date().diff(lastUpdate));
  }
}

export class FeedStatus extends HttpCommand {
  constructor(http) {
    super(http, {cmd: 'get_feeds'});
  }

  readFeedInformation() {
    return this.httpGet().then(response => {
      const {data: envelope} = response;
      const {get_feeds_response: feedsresponse} = envelope.get_feeds;

      const feeds = map(feedsresponse.feed, feed => new Feed(feed));

      return response.setData(feeds);
    });
  }
}

registerCommand('feedstatus', FeedStatus);

// vim: set ts=2 sw=2 tw=80:
