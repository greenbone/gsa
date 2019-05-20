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

import {parseEnvelopeMeta, parseXmlEncodedString} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import {success, rejection} from './xml';

const PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  ignoreNameSpace: true,
  textNodeName: '__text',
  attrValueProcessor: attr => parseXmlEncodedString(attr),
  tagValueProcessor: value => parseXmlEncodedString(value),
};

const transformXmlData = response => {
  const xmlString = response.plainData('text');
  const {envelope} = parse(xmlString, PARSER_OPTIONS);
  const meta = parseEnvelopeMeta(envelope);
  return response.set(envelope, meta);
};

const transformRejection = rej => {
  const xmlString = rej.plainData('text');
  return isDefined(xmlString) ? parse(xmlString) : undefined;
};

export default {
  success: success(transformXmlData),
  rejection: rejection(transformRejection),
};
