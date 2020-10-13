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

import {gql, useLazyQuery, useMutation} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';

import {isDefined} from 'gmp/utils/identity';
import PortList from 'gmp/models/portlist';

export const GET_PORT_LISTS = gql`
  query PortLists(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    portLists(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      nodes {
        name
        id
      }
      counts {
        total
        filtered
        offset
        limit
        length
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        lastPageCursor
      }
    }
  }
`; // only need name and id for target dialog. Some subobjects are not supported in the current query. Will add later.

export const useLazyGetPortLists = (variables, options) => {
  const [queryPortLists, {data, ...other}] = useLazyQuery(GET_PORT_LISTS, {
    ...options,
    variables,
  });

  const portLists = isDefined(data?.portLists)
    ? data.portLists.nodes.map(entity => PortList.fromObject(entity))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.portLists?.counts || {};
  const counts = isDefined(data?.portLists?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getPortLists = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryPortLists({...options, variables}),
    [queryPortLists],
  );
  const pageInfo = data?.portLists?.pageInfo;
  return [getPortLists, {...other, counts, portLists, pageInfo}];
};

export const CREATE_PORT_LIST = gql`
  mutation createPortList($input: CreatePortListInput!) {
    createPortList(input: $input) {
      id
    }
  }
`;

export const useCreatePortList = options => {
  const [queryCreatePortList, {data, ...other}] = useMutation(
    CREATE_PORT_LIST,
    options,
  );
  const createPortList = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreatePortList({...options, variables: {input: inputObject}}),
    [queryCreatePortList],
  );
  const portListId = data?.createPortList?.id;
  return [createPortList, {...other, id: portListId}];
};

export const MODIFY_PORT_LIST = gql`
  mutation modifyPortList($input: ModifyPortListInput!) {
    modifyPortList(input: $input) {
      ok
    }
  }
`;

export const useModifyPortList = options => {
  const [queryModifyPortList, data] = useMutation(MODIFY_PORT_LIST, options);
  const modifyPortList = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyPortList({...options, variables: {input: inputObject}}),
    [queryModifyPortList],
  );
  return [modifyPortList, data];
};

export const CREATE_PORT_RANGE = gql`
  mutation createPortRange($input: CreatePortRangeInput!) {
    createPortRange(input: $input) {
      id
    }
  }
`;

export const useCreatePortRange = options => {
  const [queryCreatePortRange, {data, ...other}] = useMutation(
    CREATE_PORT_RANGE,
    options,
  );
  const createPortRange = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreatePortRange({...options, variables: {input: inputObject}}),
    [queryCreatePortRange],
  );
  const portRangeId = data?.createPortRange?.id;
  return [createPortRange, {...other, id: portRangeId}];
};

export const DELETE_PORT_RANGE = gql`
  mutation deletePortRange($id: UUID!) {
    deletePortRange(id: $id) {
      ok
    }
  }
`;

export const useDeletePortRange = options => {
  const [queryDeletePortRange, data] = useMutation(DELETE_PORT_RANGE, options);
  const deletePortRange = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeletePortRange({...options, variables: {id}}),
    [queryDeletePortRange],
  );
  return [deletePortRange, data];
};

export const GET_PORT_LIST = gql`
  query PortList($id: UUID!) {
    portList(id: $id) {
      name
      id
      owner
      creationTime
      modificationTime
      writable
      inUse
      portCount {
        all
        tcp
        udp
      }
      portRanges {
        id
        start
        end
        protocolType
      }
    }
  }
`;

export const useLazyGetPortList = (id, options) => {
  const [queryPortList, {data, ...other}] = useLazyQuery(GET_PORT_LIST, {
    variables: {
      id,
    },
    options,
  });

  const portList = isDefined(data?.portList)
    ? PortList.fromObject(data.portList)
    : undefined;

  const getPortList = useCallback(id => queryPortList({id}), [queryPortList]);
  return [getPortList, {...other, portList}];
};
