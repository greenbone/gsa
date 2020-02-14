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
import {createTag, editTag, deleteTag} from '../utils';

const create = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const deleteFunc = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const save = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const gmp = {
  tag: {
    create,
    delete: deleteFunc,
    save,
  },
};
const process = {
  name: 'lorem',
  tagId: 31,
};

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
