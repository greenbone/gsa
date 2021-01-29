/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {getEntityType} from 'gmp/utils/entitytype';

import {
  CREATE_TAG,
  MODIFY_TAG,
  TOGGLE_TAG,
  REMOVE_TAG,
  ENTITY_TYPES,
  BULK_TAG,
} from '../tags';

import {createGenericQueryMock} from 'web/utils/testing';

export const createTagInput = {
  name: 'foo',
  resourceType: 'OPERATING_SYSTEM',
};

const createTagResult = {
  createTag: {
    id: '12345',
    status: 200,
  },
};

export const createTagQueryMock = () =>
  createGenericQueryMock(CREATE_TAG, createTagResult, {input: createTagInput});

export const modifyTagInput = {
  id: '12345',
};

const modifyTagResult = {
  modifyTag: {
    ok: true,
  },
};

export const modifyTagQueryMock = () =>
  createGenericQueryMock(MODIFY_TAG, modifyTagResult, {input: modifyTagInput});

const toggleTagResult = {
  toggleTag: {
    ok: true,
  },
};

export const createToggleTagQueryMock = (tag, active) => {
  return createGenericQueryMock(TOGGLE_TAG, toggleTagResult, {
    input: {id: tag.id, active},
  });
};

const removeTagResult = {
  removeTag: {
    ok: true,
  },
};

export const createRemoveTagMock = (tag, entity) => {
  const variables = {
    input: {
      id: tag.id,
      resourceIds: [entity.id],
      resourceType: ENTITY_TYPES[getEntityType(entity)],
    },
  };
  return createGenericQueryMock(REMOVE_TAG, removeTagResult, variables);
};

const bulkTagResult = {
  bulkTag: {
    ok: true,
  },
};

export const createBulkTagMock = (
  id,
  {resourceType, resourceIds, resourceFilter},
) => {
  const variables = {
    input: {
      id,
      resourceIds,
      resourceType,
      resourceFilter,
    },
  };

  return createGenericQueryMock(BULK_TAG, bulkTagResult, variables);
};
