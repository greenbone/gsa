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

import {useCallback} from 'react';

import {useMutation} from '@apollo/react-hooks';

import gql from 'graphql-tag';

export const CREATE_TAG = gql`
  mutation createTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
    }
  }
`;

export const useCreateTag = options => {
  const [queryCreateTag, {data, ...other}] = useMutation(CREATE_TAG, options);
  const createTag = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateTag({...options, variables: {input: inputObject}}),
    [queryCreateTag],
  );
  const tagId = data?.createTag?.id;
  return [createTag, {...other, id: tagId}];
};

export const MODIFY_TAG = gql`
  mutation modifyTag($input: ModifyTagInput!) {
    modifyTag(input: $input) {
      ok
    }
  }
`;

export const useModifyTag = options => {
  const [queryModifyTag, data] = useMutation(MODIFY_TAG, options);
  const modifyTag = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyTag({...options, variables: {input: inputObject}}),
    [queryModifyTag],
  );
  return [modifyTag, data];
};
