/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {success, rejection} from 'gmp/http/transform/xml';

describe('xml base transform tests', () => {
  test('should call transform function', () => {
    const fakeTransform = testing.fn().mockReturnValue('foo');
    const response = {};
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
    };
    const options = {url: 'http://foo'};
    const transform = success(fakeTransform);

    expect(() => {
      transform(response, options);
    }).toThrow();
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should not call rejection function for non error rejection', () => {
    const fakeTransform = testing.fn().mockReturnValue('foo');
    const transform = rejection(fakeTransform);
    const isError = testing.fn().mockReturnValue(false);
    const errorRejection = {
      isError,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(isError).toHaveBeenCalled();
    expect(fakeTransform).not.toHaveBeenCalled();
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
    const isError = testing.fn().mockReturnValue(true);
    const setMessage = testing.fn(() => errorRejection);
    const errorRejection = {
      isError,
      setMessage,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(isError).toHaveBeenCalled();
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
    const isError = testing.fn().mockReturnValue(true);
    const setMessage = testing.fn(() => errorRejection);
    const errorRejection = {
      isError,
      setMessage,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(isError).toHaveBeenCalled();
    expect(setMessage).toHaveBeenCalledWith('bar');
  });

  test('should transform rejection with unknown error', () => {
    const fakeTransform = testing.fn().mockReturnValue({
      envelope: {},
    });
    const transform = rejection(fakeTransform);
    const isError = testing.fn().mockReturnValue(true);
    const errorRejection = {
      isError,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(isError).toHaveBeenCalled();
  });
});
