/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Http from './http';
import transform from './transform/fastxml';
import {buildServerUrl} from './utils';

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
