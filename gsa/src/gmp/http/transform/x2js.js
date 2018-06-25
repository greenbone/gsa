/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import X2JS2 from 'x2js';

import _ from '../../locale.js';

import {is_defined} from '../../utils/identity';

import {parse_envelope_meta} from '../../parser.js';

import Rejection from '../rejection.js';

const x2js2 = new X2JS2();

export function xml2json(...args) {
  return x2js2.dom2js(...args);
}

const transform_xml_data = response => {
  const {envelope} = xml2json(response.plainData('xml'));
  const meta = parse_envelope_meta(envelope);
  return response.set(envelope, meta);
};

const success = (response, options) => {
  try {
    return transform_xml_data(response);
  }
  catch (error) {
    throw new Rejection(response.xhr, Rejection.REASON_ERROR,
      _('An error occurred while converting gmp response to js for ' +
        'url {{- url}}', {url: options.url}),
      error);
  }
};

const rejection = (rej, options) => {
  if (rej.isError && rej.isError() && rej.xhr && rej.xhr.responseXML) {

    const {envelope} = xml2json(rej.xhr.responseXML);

    if (is_defined(envelope)) {
      rej.root = envelope;

      if (is_defined(envelope.gsad_response)) {
        return rej.setMessage(envelope.gsad_response.message);
      }

      if (is_defined(envelope.action_result)) {
        return rej.setMessage(envelope.action_result.message);
      }
    }

    return rej.setMessage(_('Unknown Error'));
  }
  return rej;
};

export default {
  rejection,
  success,
};

// vim: set ts=2 sw=2 tw=80:
