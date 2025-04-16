/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Rejection from 'gmp/http/rejection';
import Response, {Meta} from 'gmp/http/response';
import transform from 'gmp/http/transform/fastxml';

const createEnvelopedXml = (xmlStr: string) =>
  `
<envelope>
  <version>123</version>
  <backend_operation>1</backend_operation>
  <vendor_version>FooBar</vendor_version>
  <i18n>en</i18n>
  <time></time>
  <timezone>UTC</timezone>
  ${xmlStr}
</envelope>
`;

const envelopeMeta = {
  backendOperation: 1,
  i18n: 'en',
  time: '',
  timezone: 'UTC',
  version: 123,
  vendorVersion: 'FooBar',
};

describe('fastxml transform tests', () => {
  test('should transform xml encoded element content successfully', () => {
    const xmlStr = createEnvelopedXml(
      '<foo>foo&quot;&lt;&gt;&amp;&apos;&#x2F;&#x5C;</foo>',
    );
    const expected = {
      foo: 'foo"<>&\'/\\',
    };
    const response = new Response<string, Meta>(
      {responseText: xmlStr} as XMLHttpRequest,
      xmlStr,
      {},
    );
    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual(expected);
    expect(transformedResponse.meta).toEqual(envelopeMeta);
  });

  test('should transform xml encoded element attribute successfully', () => {
    const xmlStr = createEnvelopedXml(
      '<foo bar="foo&quot;&lt;&gt;&amp;&apos;&#x2F;&#x5C;"></foo>',
    );
    const response = new Response<string, Meta>(
      {responseText: xmlStr} as XMLHttpRequest,
      xmlStr,
      {},
    );

    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual({
      foo: {
        _bar: 'foo"<>&\'/\\',
      },
    });
    expect(transformedResponse.meta).toEqual(envelopeMeta);
  });

  test('should create a rejection on parser errors', () => {
    const data = {foo: 'bar'};
    const response = new Response<string, Meta>(
      // @ts-expect-error
      {responseText: data} as XMLHttpRequest,
      // @ts-expect-error
      data,
      {},
    );

    expect(() => {
      transform.success(response);
    }).toThrow();
  });

  test('should transform rejection with action_result', () => {
    const xmlStr =
      '<envelope><action_result><message>foo</message></action_result></envelope>';
    const rejection = new Rejection({responseText: xmlStr} as XMLHttpRequest);
    const transformedRejection = transform.rejection(rejection);
    expect(transformedRejection).toBe(rejection);
    expect(transformedRejection.isError()).toBe(true);
    expect(transformedRejection.plainData('text')).toBe(xmlStr);
    expect(transformedRejection.message).toBe('foo');
  });

  test('should transform rejection with gsad_response', () => {
    const xmlStr =
      '<envelope><action_result><message>foo</message></action_result>' +
      '<gsad_response><message>bar</message></gsad_response></envelope>';
    const rejection = new Rejection({responseText: xmlStr} as XMLHttpRequest);
    const transformedRejection = transform.rejection(rejection);
    expect(transformedRejection).toBe(rejection);
    expect(transformedRejection.isError()).toBe(true);
    expect(transformedRejection.plainData('text')).toBe(xmlStr);
    expect(transformedRejection.message).toBe('bar');
  });

  test('should drop unknown envelope information', () => {
    const xmlStr = `
<envelope>
  <version>1.0.1</version>
  <backend_operation>0.01</backend_operation>
  <vendor_version>1.1.0</vendor_version>
  <i18n>en</i18n>
  <time>Fri Sep 14 11:26:40 2018 CEST</time>
  <timezone>Europe/Berlin</timezone>
  <foo>foo</foo>
  <bar>bar</bar>
</envelope>
`;
    const response = new Response<string, Meta>(
      {responseText: xmlStr} as XMLHttpRequest,
      xmlStr,
      {},
    );
    const transformedResponse = transform.success(response);
    expect(transformedResponse.meta).toEqual({
      version: '1.0.1',
      backendOperation: 0.01,
      vendorVersion: '1.1.0',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
    });
  });
});
