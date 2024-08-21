/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Http from './http';
import {buildServerUrl} from './utils';

import transform from './transform/fastxml';

class GmpHttp extends Http {
  constructor(settings) {
    const {apiServer, apiProtocol, timeout} = settings;
    const url = buildServerUrl(apiServer, 'gmp', apiProtocol);
    super(url, {timeout, transform});
    this.settings = settings;
  }

  getParams() {
    const params = super.getParams();
    return {
      ...params,
      token: this.settings.token,
    };
  }
}

export default GmpHttp;

// vim: set ts=2 sw=2 tw=80:
