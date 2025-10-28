/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {XMLParser} from 'fast-xml-parser';
import {type ResponseRejection} from 'gmp/http/rejection';
import {type default as Response, type Meta} from 'gmp/http/response';
import {type Transform} from 'gmp/http/transform/transform';
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

type InputResponseData = string | ArrayBuffer | XmlResponseData;

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

const getStringFromData = (data: string | ArrayBuffer) => {
  if (typeof data === 'string') {
    return data;
  } else if (data instanceof ArrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(data);
  }
  return data;
};

const transformXmlData = (
  response: Response<InputResponseData, Meta>,
): Response<XmlResponseData, XmlMeta> => {
  const data = response.data;
  let envelope: Envelope;
  if (typeof data === 'string' || data instanceof ArrayBuffer) {
    const xmlString = getStringFromData(data);
    const parsed = xmlParser.parse(xmlString);
    envelope = parsed.envelope as Envelope;
  } else {
    envelope = data.envelope as Envelope;
  }
  if (!isDefined(envelope)) {
    throw new Error('No envelope found in response');
  }
  return response.set(envelope, parseEnvelopeMeta(envelope));
};

const transformRejection = (rej: ResponseRejection) => {
  const data = rej.data;
  if (!isDefined(data)) {
    return rej;
  }

  const xmlString = getStringFromData(data);
  return xmlParser.parse(xmlString);
};

const transformObject: Transform<
  string | ArrayBuffer | XmlResponseData,
  Meta,
  XmlResponseData,
  XmlMeta
> = {
  success: success(transformXmlData),
  rejection: rejection(transformRejection),
};

export default transformObject;
