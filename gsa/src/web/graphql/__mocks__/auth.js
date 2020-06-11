/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {GET_CURRENT_USER_IS_AUTHENTICATED} from '../auth';

export const createIsAuthenticatedQueryMock = (isAuthenticated = true) => {
  const queryResult = {
    data: {
      currentUser: {
        isAuthenticated,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_CURRENT_USER_IS_AUTHENTICATED,
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

export const createIsAuthenticatedQueryErrorMock = (
  error = new Error('An error has occurred.'),
) => {
  const queryMock = {
    request: {
      query: GET_CURRENT_USER_IS_AUTHENTICATED,
    },
    error,
  };
  return [queryMock];
};
