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
import gql from 'graphql-tag';

import {useMutation} from '@apollo/react-hooks';

import {toInputObject} from 'web/utils/graphql';

export const CREATE_TARGET = gql`
  mutation createTarget($input: CreateTargetInput!) {
    createTarget(input: $input) {
      id
      status
    }
  }
`;

export const useCreateTarget = () => {
  const [createTarget] = useMutation(CREATE_TARGET);
  return toInputObject(createTarget);
};

export const MODIFY_TARGET = gql`
  mutation modifyTarget($input: ModifyTargetInput!) {
    modifyTarget(input: $input) {
      id
      status
    }
  }
`;

export const useModifyTarget = () => {
  const [modifyTarget] = useMutation(MODIFY_TARGET);
  return toInputObject(modifyTarget);
};
