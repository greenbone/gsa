/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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

import {GET_SETTING} from '../settings';

export const createGetSettingQueryMock = (
  id,
  {comment = 'A comment', name = 'foo', value = 'bar'},
) => {
  const queryResult = {
    data: {
      userSetting: {
        id,
        comment,
        name,
        value,
      },
    },
  };

  const resultFunc = jest.fn().mockReturnValue(queryResult);

  const queryMock = {
    request: {
      query: GET_SETTING,
      variables: {
        id,
      },
    },
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};
