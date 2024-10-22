/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {FeedStatus} from 'gmp/commands/feedstatus';

export const buildUrlParams = params => {
  let argcount = 0;
  let uri = '';

  for (const [key, value] of Object.entries(params)) {
    if (isDefined(value)) {
      if (argcount++) {
        uri += '&';
      }
      uri += encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }
  }
  return uri;
};

export const buildServerUrl = (server, path = '', protocol) => {
  if (isDefined(protocol)) {
    if (!protocol.endsWith(':')) {
      protocol += ':';
    }
  } else {
    protocol = window.location.protocol;
  }
  return protocol + '//' + server + '/' + path;
};

export async function getFeedAccessStatusMessage(context) {
  const feedStatus = new FeedStatus(context);
  const {isFeedOwner, isFeedResourcesAccess} =
    await feedStatus.checkFeedOwnerAndPermissions();
  const syncMessage = _(
    'This issue may be due to the feed not having completed its synchronization.\nPlease try again shortly.',
  );

  if (!isFeedOwner) {
    return `${_('The feed owner is currently not set.')} ${syncMessage}`;
  } else if (!isFeedResourcesAccess) {
    return `${_('Access to the feed resources is currently restricted.')} ${syncMessage}`;
  }

  return '';
}

export const findActionInXMLString = (string, actions) => {
  const regex = /<action>(.*?)<\/action>/g;
  const matches = string.match(regex) || [];
  return matches.some(match =>
    actions.includes(match.replace(/<\/?action>/g, '')),
  );
};
