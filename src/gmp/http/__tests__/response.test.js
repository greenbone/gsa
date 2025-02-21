/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Response from 'gmp/http/response';

describe('Response tests', () => {
  test('should allow to get plain data', () => {
    const xhr = {
      response: 'foo',
      responseText: 'bar',
      responseXML: 'ipsum',
    };
    const response = new Response(xhr, {});

    expect(response.plainData()).toEqual('foo');
    expect(response.plainData('text')).toEqual('bar');
    expect(response.plainData('xml')).toEqual('ipsum');
  });
});
