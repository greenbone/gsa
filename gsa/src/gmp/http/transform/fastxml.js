/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {parse} from 'fast-xml-parser';

import {_} from 'gmp/locale/lang';

import {parseEnvelopeMeta} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import Rejection from '../rejection';

const PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  ignoreNameSpace: true,
  textNodeName: '__text',
};

const transform_xml_data = response => {
  const {envelope} = parse(response.data, PARSER_OPTIONS);
  const meta = parseEnvelopeMeta(envelope);
  return response.set(envelope, meta);
};

const success = (response, options) => {
  try {
    return transform_xml_data(response);
  } catch (error) {
    throw new Rejection(
      response.xhr,
      Rejection.REASON_ERROR,
      _(
        'An error occurred while converting gmp response to js for ' +
          'url {{- url}}',
        {url: options.url},
      ),
      error,
    );
  }
};

const rejection = (rej, options) => {
  if (rej.isError && rej.isError() && rej.xhr && rej.xhr.responseXML) {
    const {envelope} = parse(rej.xhr.response);

    if (isDefined(envelope)) {
      rej.root = envelope;

      if (isDefined(envelope.gsad_response)) {
        return rej.setMessage(envelope.gsad_response.message);
      }

      if (isDefined(envelope.action_result)) {
        return rej.setMessage(envelope.action_result.message);
      }
    }

    return rej.setMessage(_('Unknown Error'));
  }
  return rej;
};

export default {
  success,
  rejection,
};
