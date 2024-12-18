/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {XMLParser} from 'fast-xml-parser';
import {parseEnvelopeMeta, parseXmlEncodedString} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

import {success, rejection} from './xml';

const PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  removeNSPrefix: true,
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
