/* Copyright (C) 2019-2022 Greenbone AG
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
    const fakeTransform = vi.fn().mockReturnValue('foo');
    const response = {};
    const options = {};

    const transform = success(fakeTransform);
    expect(transform(response, options)).toEqual('foo');
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should throw rejection in case of success transform errors', () => {
    const fakeTransform = vi.fn(() => {
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
      `
      Rejection {
        "_xhr": {},
        "error": [Error: foo],
        "message": "An error occurred while converting gmp response to js for url http://foo",
        "name": "Rejection",
        "reason": "error",
        "stack": "Error: foo
          at /home/bricks/source/greenbone/gsa-vite/src/gmp/http/transform/__tests__/xml.js:37:13
          at mockCall (file:///home/bricks/source/greenbone/gsa-vite/node_modules/@vitest/spy/dist/index.js:50:17)
          at spy (file:///home/bricks/source/greenbone/gsa-vite/node_modules/tinyspy/dist/index.js:42:80)
          at /home/bricks/source/greenbone/gsa-vite/src/gmp/http/transform/xml.js:26:12
          at /home/bricks/source/greenbone/gsa-vite/src/gmp/http/transform/__tests__/xml.js:47:7
          at getError (file:///home/bricks/source/greenbone/gsa-vite/node_modules/vitest/dist/vendor/vi.Fxjax7rQ.js:203:5)
          at Proxy.__INLINE_SNAPSHOT__ (file:///home/bricks/source/greenbone/gsa-vite/node_modules/vitest/dist/vendor/vi.Fxjax7rQ.js:340:19)
          at Proxy.methodWrapper (/home/bricks/source/greenbone/gsa-vite/node_modules/chai/lib/chai/utils/addMethod.js:57:25)
          at /home/bricks/source/greenbone/gsa-vite/src/gmp/http/transform/__tests__/xml.js:48:8
          at file:///home/bricks/source/greenbone/gsa-vite/node_modules/@vitest/runner/dist/index.js:135:14",
      }
    `,
    );
    expect(fakeTransform).toHaveBeenCalledWith(response);
  });

  test('should not call rejection function for non error rejection', () => {
    const fakeTransform = vi.fn().mockReturnValue('foo');
    const transform = rejection(fakeTransform);
    const isError = vi.fn().mockReturnValue(false);
    const errorRejection = {
      isError,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(isError).toHaveBeenCalled();
    expect(fakeTransform).not.toHaveBeenCalled();
  });

  test('should transform rejection with action_result', () => {
    const fakeTransform = vi.fn().mockReturnValue({
      envelope: {
        action_result: {
          message: 'foo',
        },
      },
    });
    const transform = rejection(fakeTransform);
    const isError = vi.fn().mockReturnValue(true);
    const setMessage = vi.fn(() => errorRejection);
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
    const fakeTransform = vi.fn().mockReturnValue({
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
    const isError = vi.fn().mockReturnValue(true);
    const setMessage = vi.fn(() => errorRejection);
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
    const fakeTransform = vi.fn().mockReturnValue({
      envelope: {},
    });
    const transform = rejection(fakeTransform);
    const isError = vi.fn().mockReturnValue(true);
    const errorRejection = {
      isError,
    };

    expect(transform(errorRejection)).toBe(errorRejection);
    expect(fakeTransform).toHaveBeenCalledWith(errorRejection);
    expect(isError).toHaveBeenCalled();
  });
});
