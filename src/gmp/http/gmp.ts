/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Http, {HttpOptions} from 'gmp/http/http';
import {Meta} from 'gmp/http/response';
import transform, {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import {buildServerUrl} from 'gmp/http/utils';

interface GmpHttpSettings
  extends HttpOptions<string, Meta, XmlResponseData, XmlMeta> {
  apiServer: string;
  apiProtocol: string;
  token: string;
}

class GmpHttp extends Http<string, Meta, XmlResponseData, XmlMeta> {
  settings: GmpHttpSettings;

  constructor(settings: GmpHttpSettings) {
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
