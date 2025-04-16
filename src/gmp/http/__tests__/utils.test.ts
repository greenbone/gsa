/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {buildUrlParams, buildServerUrl} from 'gmp/http/utils';

describe('buildUrlParams', () => {
  test('should return an empty string for an empty params object', () => {
    expect(buildUrlParams({})).toBe('');
  });

  test('should build a query string from a params object', () => {
    const params = {foo: 'bar', baz: 42, qux: true};
    expect(buildUrlParams(params)).toBe('foo=bar&baz=42&qux=true');
  });

  test('should skip undefined values in the params object', () => {
    const params = {foo: 'bar', baz: undefined, qux: false};
    expect(buildUrlParams(params)).toBe('foo=bar&qux=false');
  });

  test('should encode keys and values', () => {
    const params = {'foo bar': 'baz qux', 'special&char': 'value&test'};
    expect(buildUrlParams(params)).toBe(
      'foo%20bar=baz%20qux&special%26char=value%26test',
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
