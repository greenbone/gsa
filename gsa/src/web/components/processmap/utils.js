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

export const createTag = ({name, gmp}) => {
  return gmp.tag
    .create({
      active: '1',
      name,
      resource_type: 'host',
    })
    .then(response => {
      const {data = {}} = response;
      return data.id;
    });
};

export const editTag = ({action = 'add', name, hostIds, tagId, gmp}) => {
  return gmp.tag.save({
    active: '1',
    name,
    id: tagId,
    resource_ids: hostIds,
    resource_type: 'host',
    resources_action: action, // this always needs to be sent, even without
    // adding new resources in order to prevent
    // emptying the list when only changing the name
  });
};

export const deleteTag = ({tagId, gmp}) => {
  return gmp.tag.delete({
    id: tagId,
  });
};

// vim: set ts=2 sw=2 tw=80:
