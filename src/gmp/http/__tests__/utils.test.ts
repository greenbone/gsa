/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {buildUrlParams, buildServerUrl, formdataAppend} from 'gmp/http/utils';

describe('buildUrlParams', () => {
  test('should return an empty string for an empty params object', () => {
    expect(buildUrlParams({})).toEqual('');
  });

  test('should build a query string from a params object', () => {
    const params = {foo: 'bar', baz: 42, qux: true};
    expect(String(buildUrlParams(params))).toEqual('foo=bar&baz=42&qux=true');
  });

  test('should skip undefined values in the params object', () => {
    const params = {foo: 'bar', baz: undefined, qux: false};
    expect(String(buildUrlParams(params))).toEqual('foo=bar&qux=false');
  });

  test('should encode keys and values', () => {
    const params = {'foo bar': 'baz qux', 'special&char': 'value&test'};
    expect(buildUrlParams(params)).toEqual(
      'foo+bar=baz+qux&special%26char=value%26test',
    );
  });
});

describe('buildServerUrl', () => {
  test('should build a URL with the given server and path', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error
    globalThis.window = {location: {protocol: 'http:'}};
    expect(buildServerUrl('example.com', 'api/v1')).toBe(
      `${window.location.protocol}//example.com/api/v1`,
    );
    globalThis.window = originalWindow;
  });

  test('should use the provided protocol if specified', () => {
    expect(buildServerUrl('example.com', 'api/v1', 'https')).toBe(
      'https://example.com/api/v1',
    );
  });

  test('should append ":" to the protocol if missing', () => {
    expect(buildServerUrl('example.com', 'api/v1', 'https')).toBe(
      'https://example.com/api/v1',
    );
  });

  test('should handle an empty path', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error
    globalThis.window = {location: {protocol: 'http:'}};
    expect(buildServerUrl('example.com')).toBe(
      `${window.location.protocol}//example.com/`,
    );
    globalThis.window = originalWindow;
  });
});

describe('formdataAppend', () => {
  test('should append a string value to FormData', () => {
    const formdata = new FormData();
    formdataAppend(formdata, 'key', 'value');
    expect(formdata.get('key')).toBe('value');
  });

  test('should append a number value to FormData', () => {
    const formdata = new FormData();
    formdataAppend(formdata, 'key', 42);
    expect(formdata.get('key')).toBe('42');
  });

  test('should append a boolean value to FormData', () => {
    const formdata = new FormData();
    formdataAppend(formdata, 'key', true);
    expect(formdata.get('key')).toBe('true');
  });

  test('should not append undefined or null values to FormData', () => {
    const formdata = new FormData();
    formdataAppend(formdata, 'key', undefined);
    expect(formdata.has('key')).toBe(false);
  });

  test('should append a Blob value to FormData', async () => {
    const formdata = new FormData();
    const blob = new Blob(['test'], {type: 'text/plain'});
    formdataAppend(formdata, 'key', blob);
    const appendedBlob = formdata.get('key') as Blob;
    expect(appendedBlob.type).toEqual('text/plain');
    expect(appendedBlob.size).toEqual(4);
    await expect(appendedBlob.text()).resolves.toEqual('test');
  });
});
