/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {isDefined} from 'gmp/utils/identity';

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

// vim: set ts=2 sw=2 tw=80:
