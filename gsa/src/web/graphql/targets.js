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

export const CREATE_TARGET = gql`
  mutation createTarget($input: CreateTargetInput!) {
    createTarget(input: $input) {
      id
    }
  }
`;

export const useCreateTarget = options => {
  const [queryCreateTarget, {data, ...other}] = useMutation(
    CREATE_TARGET,
    options,
  );
  const createTarget = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateTarget({...options, variables: {input: inputObject}}),
    [queryCreateTarget],
  );
  const targetId = data?.createTarget?.id;
  return [createTarget, {...other, id: targetId}];
};

export const MODIFY_TARGET = gql`
  mutation modifyTarget($input: ModifyTargetInput!) {
    modifyTarget(input: $input) {
      ok
    }
  }
`;

export const useModifyTarget = options => {
  const [queryModifyTarget, data] = useMutation(MODIFY_TARGET, options);
  const modifyTarget = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyTarget({...options, variables: {input: inputObject}}),
    [queryModifyTarget],
  );
  return [modifyTarget, data];
};
