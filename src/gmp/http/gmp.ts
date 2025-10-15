/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Http from 'gmp/http/http';
import {type Meta} from 'gmp/http/response';
import transform, {
  type XmlMeta,
  type XmlResponseData,
} from 'gmp/http/transform/fastxml';
import {buildServerUrl, type UrlParams as Params} from 'gmp/http/utils';

interface GmpHttpSettings {
  apiServer: string;
  apiProtocol?: string;
  timeout?: number;
  token?: string;
}

interface GmpHttpParams extends Params {
  token?: string;
}

class GmpHttp extends Http<string, Meta, XmlResponseData, XmlMeta> {
  settings: GmpHttpSettings;

  constructor(settings: GmpHttpSettings) {
    const {apiServer, apiProtocol, timeout} = settings;
    const url = buildServerUrl(apiServer, 'gmp', apiProtocol);
    super(url, {timeout, transform});
    this.settings = settings;
  }

  getParams(): GmpHttpParams {
    const params = super.getParams();
    return {
      ...params,
      token: this.settings.token,
    };
  }
}

export default GmpHttp;
