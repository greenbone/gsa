/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {XMLParser} from 'fast-xml-parser';
import Rejection from 'gmp/http/rejection';
import Response, {Meta} from 'gmp/http/response';
import {Transform} from 'gmp/http/transform/transform';
import {success, rejection} from 'gmp/http/transform/xml';
import {parseXmlEncodedString} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export interface XmlMeta {
  version?: string;
  backendOperation?: string;
  vendorVersion?: string;
  i18n?: string;
  time?: string;
  timezone?: string;
  [key: string]: string | undefined;
}

export type XmlResponseData = Record<string, unknown>;

type Envelope = Record<string, string | undefined>;

const PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  removeNSPrefix: true,
  textNodeName: '__text',
  attributeValueProcessor: (_name: string, value: string) =>
    parseXmlEncodedString(value),
  tagValueProcessor: (_name: string, value: string) =>
    parseXmlEncodedString(value),
};

const xmlParser = new XMLParser(PARSER_OPTIONS);

const ENVELOPE_PROPS = [
  ['version', 'version'],
  ['backend_operation', 'backendOperation'],
  ['vendor_version', 'vendorVersion'],
  ['i18n', 'i18n'],
  ['time', 'time'],
  ['timezone', 'timezone'],
] as const;

const parseEnvelopeMeta = (envelope: Envelope): XmlMeta => {
  const meta: XmlMeta = {};

  for (const [name, to] of ENVELOPE_PROPS) {
    meta[to] = envelope[name];
    delete envelope[name];
  }
  return meta;
};

const transformXmlData = (
  response: Response<string, Meta>,
): Response<XmlResponseData, XmlMeta> => {
  const xmlString = response.plainData('text') as string;
  const {envelope} = xmlParser.parse(xmlString);
  const meta = parseEnvelopeMeta(envelope);
  return response.set(envelope, meta);
};

const transformRejection = (rej: Rejection) => {
  const xmlString = rej.plainData('text') as string;
  return isDefined(xmlString) ? xmlParser.parse(xmlString) : undefined;
};

const transformObject: Transform<string, Meta, XmlResponseData, XmlMeta> = {
  success: success(transformXmlData),
  rejection: rejection(transformRejection),
};

export default transformObject;
