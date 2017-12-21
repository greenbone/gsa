/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import _ from '../locale.js';

import {is_defined} from '../utils.js';

import xml2json from '../xml2json.js';
import {parse_envelope_meta} from '../parser.js';

import Http from './http.js';
import Rejection from './rejection.js';
import {build_server_url} from './utils.js';


class GmpHttp extends Http {

  constructor(server, protocol, options) {
    const url = build_server_url(server, 'omp', protocol);
    super(url, options);

    this.params.xml = 1;
  }

  get token() {
    return this.params.token;
  }

  set token(token) {
    this.params.token = token;
  }

  transformXmlData(response, xml) {
      const {envelope} = xml2json(xml);
      const meta = parse_envelope_meta(envelope);
      return response.set(envelope, meta);
  }

  transformSuccess(xhr, {plain = false, ...options}) {
    try {
      const response = super.transformSuccess(xhr, options);
      return plain ?
        response :
        this.transformXmlData(response, xhr.responseXML);
    }
    catch (error) {
      throw new Rejection(xhr, Rejection.REASON_ERROR,
        _('An error occurred while converting gmp response to js for ' +
          'url {{- url}}', {url: options.url}),
        error);
    }
  }

  transformRejection(rej, options) {
    if (rej.isError && rej.isError() && rej.xhr && rej.xhr.responseXML) {

      const root = xml2json(rej.xhr.responseXML).envelope;

      if (is_defined(root)) {
        rej.root = root;

        if (is_defined(root.gsad_response)) {
          return rej.setMessage(root.gsad_response.message);
        }

        if (is_defined(root.action_result)) {
          return rej.setMessage(root.action_result.message);
        }

        return rej.setMessage(_('Unknown Error'));
      }
    }
    return rej;
  }
}

export default GmpHttp;

// vim: set ts=2 sw=2 tw=80:
