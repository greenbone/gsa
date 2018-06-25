/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import {HttpCommand, register_command} from '../command.js';

import {parseDate} from '../parser.js';

import {map} from '../utils/array';

import date, {duration} from '../models/date';

const convertVersion = version => version.slice(0, 8) + 'T' +
  version.slice(8, 12);

export const NVT_FEED = 'NVT';
export const CERT_FEED = 'CERT';
export const SCAP_FEED = 'SCAP';

class Feed {

  constructor({
    type,
    name,
    description,
    status,
    version,
  }) {
    this.feed_type = type;
    this.name = name;
    this.description = description;
    this.status = status;

    const versionDate = convertVersion(version);
    this.version = versionDate;

    const lastUpdate = parseDate(versionDate);
    this.age = duration(date().diff(lastUpdate));
  }
}

class FeedStatus extends HttpCommand {

  constructor(http) {
    super(http, {cmd: 'get_feeds'});
  }

  readFeedInformation() {
    return this.httpGet().then(response => {
      const {data: envelope} = response;
      const {get_feeds_response: feedsresponse} =
        envelope.get_feeds.commands_response;

      const feeds = map(feedsresponse.feed, feed => new Feed(feed));

      return response.setData(feeds);
    });
  }
}

register_command('feedstatus', FeedStatus);

// vim: set ts=2 sw=2 tw=80:
