/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {ResponseRejection} from 'gmp/http/rejection';
import Response, {type Meta} from 'gmp/http/response';
import transform, {
  type Envelope,
  type XmlResponseData,
} from 'gmp/http/transform/fast-xml';

const createEnvelopedXml = (xmlStr: string) =>
  `
<envelope>
  <client_address>1.2.3.4</client_address>
  <i18n>en</i18n>
  <session>1234567890</session>
  <timezone>UTC</timezone>
  <token>abc123</token>
  <version>1.2.3</version>
  ${xmlStr}
</envelope>
`;

const envelope: Envelope = {
  client_address: '1.2.3.4',
  i18n: 'en',
  session: 1234567890,
  timezone: 'UTC',
  token: 'abc123',
  version: '1.2.3',
};

const createExpectedData = (data: Record<string, unknown>) => {
  return {
    ...envelope,
    ...data,
  };
};

describe('fastxml transform tests', () => {
  test('should transform xml encoded element content successfully', () => {
    const xmlStr = createEnvelopedXml(
      '<foo>foo&quot;&lt;&gt;&amp;&apos;&#x2F;&#x5C;</foo>',
    );
    const expected = createExpectedData({
      foo: 'foo"<>&\'/\\',
    });
    const response = new Response<string, Meta>(xmlStr, {});
    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual(expected);
  });

  test('should transform array buffer xml response successfully', () => {
    const xmlStr = createEnvelopedXml('<foo>bar</foo>');
    const encoder = new TextEncoder();
    const xmlBuffer = encoder.encode(xmlStr).buffer;
    const response = new Response<ArrayBuffer, Meta>(xmlBuffer, {});
    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual(createExpectedData({foo: 'bar'}));
  });

  test('should transform xml object response successfully', () => {
    const xmlObj = {
      envelope: {
        ...envelope,
        foo: 'bar',
      },
    };
    const response = new Response<XmlResponseData>(xmlObj);
    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual(createExpectedData({foo: 'bar'}));
  });

  test('should transform xml encoded element attribute successfully', () => {
    const xmlStr = createEnvelopedXml(
      '<foo bar="foo&quot;&lt;&gt;&amp;&apos;&#x2F;&#x5C;"></foo>',
    );
    const response = new Response<string>(xmlStr);

    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual(
      createExpectedData({
        foo: {
          _bar: 'foo"<>&\'/\\',
        },
      }),
    );
  });

  test('should create a rejection on parser errors', () => {
    const data = {foo: 'bar'};
    // @ts-expect-error
    const response = new Response<string>(data);

    expect(() => {
      transform.success(response);
    }).toThrow();
  });

  test('should transform rejection with action_result', () => {
    const xmlStr =
      '<envelope><action_result><message>foo</message></action_result></envelope>';
    const rejection = new ResponseRejection({
      status: 500,
      response: xmlStr,
    } as XMLHttpRequest);
    const transformedRejection = transform.rejection(rejection);
    expect(transformedRejection).toBe(rejection);
    expect(transformedRejection.message).toBe('foo');
  });

  test('should transform rejection with gsad_response', () => {
    const xmlStr =
      '<envelope><action_result><message>foo</message></action_result>' +
      '<gsad_response><message>bar</message></gsad_response></envelope>';
    const rejection = new ResponseRejection({
      status: 500,
      response: xmlStr,
    } as XMLHttpRequest);
    const transformedRejection = transform.rejection(rejection);
    expect(transformedRejection).toBe(rejection);
    expect(transformedRejection.message).toBe('bar');
  });

  test('should transform elements with long values', () => {
    const longValue = 'a'.repeat(100000);
    const xmlStr = createEnvelopedXml(`<foo>${longValue}</foo>`);
    const response = new Response<string, Meta>(xmlStr, {});
    const transformedResponse = transform.success(response);
    expect(transformedResponse.data).toEqual(
      createExpectedData({foo: longValue}),
    );
  });
});
