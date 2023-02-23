/* Copyright (C) 2017-2022 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {XMLParser} from 'fast-xml-parser';

import {parseEnvelopeMeta, parseXmlEncodedString} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import {success, rejection} from './xml';

const PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  ignoreNameSpace: true,
  textNodeName: '__text',
  attributeValueProcessor: (name, value, jPath) => parseXmlEncodedString(value),
  tagValueProcessor: (name, value, jPath, hasAttributes, isLeafNode) =>
    parseXmlEncodedString(value),
};

const xmlParser = new XMLParser(PARSER_OPTIONS);

const transformXmlData = response => {
  const xmlString = response.plainData('text');
  const {envelope} = xmlParser.parse(xmlString);
  const meta = parseEnvelopeMeta(envelope);
  return response.set(envelope, meta);
};

const transformRejection = rej => {
  const xmlString = rej.plainData('text');
  return isDefined(xmlString) ? xmlParser.parse(xmlString) : undefined;
};

const transformObject = {
  success: success(transformXmlData),
  rejection: rejection(transformRejection),
};

export default transformObject;
