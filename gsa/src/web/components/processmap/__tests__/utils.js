/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import {createTag, editTag, deleteTag} from '../utils';

const process = {
  name: 'lorem',
  tagId: 31,
};

let create;
let deleteFunc;
let gmp;
let save;

beforeEach(() => {
  create = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  deleteFunc = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  save = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  gmp = {
    tag: {
      create,
      delete: deleteFunc,
      save,
    },
  };
});

describe('processmap utils tests', () => {
  test('should call create command', () => {
    const {name} = process;
    const input = {
      active: '1',
      name: name,
      resource_type: 'host',
    };

    createTag({name, gmp});
    expect(create).toHaveBeenCalledWith(input);
  });

  test('should call save command for adding hosts', () => {
    const {name, tagId} = process;
    const hostIds = ['1a', '2b'];
    const input = {
      active: '1',
      name: name,
      id: tagId,
      resource_ids: hostIds,
      resource_type: 'host',
      resources_action: 'add',
    };

    editTag({hostIds, name, tagId, gmp});
    expect(save).toHaveBeenCalledWith(input);
  });

  test('should call save command for deleting hosts', () => {
    const {name, tagId} = process;
    const hostIds = ['1a'];
    const input = {
      active: '1',
      name: name,
      id: tagId,
      resource_ids: hostIds,
      resource_type: 'host',
      resources_action: 'remove',
    };

    editTag({action: 'remove', hostIds, name, tagId, gmp});
    expect(save).toHaveBeenCalledWith(input);
  });

  test('should call delete command', () => {
    const {tagId} = process;
    const input = {
      id: tagId,
    };

    deleteTag({tagId, gmp});
    expect(deleteFunc).toHaveBeenCalledWith(input);
  });
});
