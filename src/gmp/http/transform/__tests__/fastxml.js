/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
    const plainData = jest.fn().mockReturnValue(xmlStr);
    const setData = jest.fn().mockReturnValue('foo');
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
    const plainData = jest.fn().mockReturnValue(xmlStr);
    const setData = jest.fn().mockReturnValue('foo');
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
    const plainData = jest.fn().mockReturnValue({foo: 'bar'});
    const setData = jest.fn().mockReturnValue('foo');
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
    const isError = jest.fn().mockReturnValue(true);
    const setMessage = jest.fn(() => errorRejection);
    const plainData = jest.fn().mockReturnValue(xmlStr);
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
    const isError = jest.fn().mockReturnValue(true);
    const setMessage = jest.fn(() => errorRejection);
    const plainData = jest.fn().mockReturnValue(xmlStr);
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
