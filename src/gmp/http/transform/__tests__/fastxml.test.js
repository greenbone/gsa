/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import transform from '../fastxml';

const createEnvelopedXml = xmlStr =>
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
    const plainData = testing.fn().mockReturnValue(xmlStr);
    const setData = testing.fn().mockReturnValue('foo');
    const response = {
      plainData,
      set: setData,
    };

    expect(transform.success(response)).toEqual('foo');
    expect(plainData).toHaveBeenCalledWith('text');
    expect(setData).toHaveBeenCalledWith(
      {
        foo: 'foo"<>&\'/\\',
      },
      envelopeMeta,
    );
  });

  test('should transform xml encoded element attribute successfully', () => {
    const xmlStr = createEnvelopedXml(
      '<foo bar="foo&quot;&lt;&gt;&amp;&apos;&#x2F;&#x5C;"></foo>',
    );
    const plainData = testing.fn().mockReturnValue(xmlStr);
    const setData = testing.fn().mockReturnValue('foo');
    const response = {
      plainData,
      set: setData,
    };

    expect(transform.success(response)).toEqual('foo');
    expect(plainData).toHaveBeenCalledWith('text');
    expect(setData).toHaveBeenCalledWith(
      {
        foo: {
          _bar: 'foo"<>&\'/\\',
        },
      },
      envelopeMeta,
    );
  });

  test('should create a rejection on parser errors', () => {
    const plainData = testing.fn().mockReturnValue({foo: 'bar'});
    const setData = testing.fn().mockReturnValue('foo');
    const response = {
      plainData,
      set: setData,
    };

    expect(() => {
      transform.success(response);
    }).toThrow();
  });

  test('should transform rejection with action_result', () => {
    const xmlStr =
      '<envelope><action_result><message>foo</message></action_result></envelope>';
    const isError = testing.fn().mockReturnValue(true);
    const setMessage = testing.fn(() => errorRejection);
    const plainData = testing.fn().mockReturnValue(xmlStr);
    const errorRejection = {
      isError,
      setMessage,
      plainData,
    };

    expect(transform.rejection(errorRejection)).toBe(errorRejection);
    expect(isError).toHaveBeenCalled();
    expect(plainData).toHaveBeenCalledWith('text');
    expect(setMessage).toHaveBeenCalledWith('foo');
  });

  test('should transform rejection with gsad_response', () => {
    const xmlStr =
      '<envelope><action_result><message>foo</message></action_result>' +
      '<gsad_response><message>bar</message></gsad_response></envelope>';
    const isError = testing.fn().mockReturnValue(true);
    const setMessage = testing.fn(() => errorRejection);
    const plainData = testing.fn().mockReturnValue(xmlStr);
    const errorRejection = {
      isError,
      setMessage,
      plainData,
    };

    expect(transform.rejection(errorRejection)).toBe(errorRejection);
    expect(isError).toHaveBeenCalled();
    expect(plainData).toHaveBeenCalledWith('text');
    expect(setMessage).toHaveBeenCalledWith('bar');
  });
});
