/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {type ResponseRejection} from 'gmp/http/rejection';
import {type default as Response, type Meta} from 'gmp/http/response';
import {success, rejection} from 'gmp/http/transform/xml';

describe('xml base transform tests', () => {
  test('should call transform function', () => {
    const fakeTransform = testing.fn().mockReturnValue('foo');
    const response = {} as Response<string, Meta>;
    const options = {};

    const transform = success(fakeTransform);
    expect(transform(response, options)).toEqual('foo');
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should throw rejection in case of success transform errors', () => {
    const fakeTransform = testing.fn(() => {
      throw new Error('foo');
    });
    const xhr = {};
    const response = {
      xhr,
    } as unknown as Response<string, Meta>;
    const options = {url: 'http://foo'};
    const transform = success(fakeTransform);

    expect(() => {
      transform(response, options);
    }).toThrow();
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should transform rejection with action_result', () => {
    const fakeTransform = testing.fn().mockReturnValue({
      envelope: {
        action_result: {
          message: 'foo',
        },
      },
    });
    const transform = rejection(fakeTransform);
    const setMessage = testing.fn(() => errorRejection);
    const errorRejection = {
      setMessage,
    } as unknown as ResponseRejection;

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(setMessage).toHaveBeenCalledWith('foo');
  });

  test('should transform rejection with gsad_response', () => {
    const fakeTransform = testing.fn().mockReturnValue({
      envelope: {
        action_result: {
          message: 'foo',
        },
        gsad_response: {
          message: 'bar',
        },
      },
    });
    const transform = rejection(fakeTransform);
    const setMessage = testing.fn(() => errorRejection);
    const errorRejection = {
      setMessage,
    } as unknown as ResponseRejection;

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(setMessage).toHaveBeenCalledWith('bar');
  });

  test('should transform rejection with unknown error', () => {
    const fakeTransform = testing.fn().mockReturnValue({
      envelope: {},
    });
    const transform = rejection(fakeTransform);
    const errorRejection = {} as unknown as ResponseRejection;

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
  });
});
