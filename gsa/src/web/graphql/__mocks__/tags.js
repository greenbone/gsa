/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {CREATE_TAG, MODIFY_TAG} from '../tags';

export const createTagInput = {
  name: 'foo',
  resourceType: 'OPERATING_SYSTEM',
};

export const modifyTagInput = {
  id: '12345',
};

export const createCreateTagMock = () => {
  const createTagResult = jest.fn().mockReturnValue({
    data: {
      createTag: {
        id: '12345',
        status: 200,
      },
    },
  });

  const queryMock = {
    request: {
      query: CREATE_TAG,
      variables: {input: createTagInput},
    },
    newData: createTagResult,
  };

  return [queryMock, createTagResult];
};

export const createModifyTagMock = () => {
  const modifyTagResult = jest.fn().mockReturnValue({
    data: {
      modifyTag: {
        ok: true,
      },
    },
  });

  const queryMock = {
    request: {
      query: MODIFY_TAG,
      variables: {input: modifyTagInput},
    },
    newData: modifyTagResult,
  };

  return [queryMock, modifyTagResult];
};
