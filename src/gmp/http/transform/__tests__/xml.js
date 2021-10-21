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
import {setLocale} from 'gmp/locale/lang';

import {success, rejection} from '../xml';

setLocale('en');

describe('xml base transform tests', () => {
  test('should call transform function', () => {
    const fakeTransform = jest.fn().mockReturnValue('foo');
    const response = {};
    const options = {};

    const transform = success(fakeTransform);
    expect(transform(response, options)).toEqual('foo');
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should throw rejection in case of success transform errors', () => {
    const fakeTransform = jest.fn(() => {
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
    }).toThrowErrorMatchingInlineSnapshot(
      `"An error occurred while converting gmp response to js for url http://foo"`,
    );
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should not call rejection function for non error rejection', () => {
    const fakeTransform = jest.fn().mockReturnValue('foo');
    const transform = rejection(fakeTransform);
    const isError = jest.fn().mockReturnValue(false);
    const errorRejection = {
      isError,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(isError).toHaveBeenCalled();
    expect(fakeTransform).not.toHaveBeenCalled();
  });

  test('should transform rejection with action_result', () => {
    const fakeTransform = jest.fn().mockReturnValue({
      envelope: {
        action_result: {
          message: 'foo',
        },
      },
    });
    const transform = rejection(fakeTransform);
    const isError = jest.fn().mockReturnValue(true);
    const setMessage = jest.fn(() => errorRejection);
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
    const fakeTransform = jest.fn().mockReturnValue({
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
    const isError = jest.fn().mockReturnValue(true);
    const setMessage = jest.fn(() => errorRejection);
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
    const fakeTransform = jest.fn().mockReturnValue({
      envelope: {},
    });
    const transform = rejection(fakeTransform);
    const isError = jest.fn().mockReturnValue(true);
    const errorRejection = {
      isError,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(isError).toHaveBeenCalled();
  });
});
