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

import {useCallback} from 'react';

import {useLazyQuery, useMutation, useQuery} from '@apollo/client';

import gql from 'graphql-tag';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Override from 'gmp/models/override';

import {isDefined} from 'gmp/utils/identity';

export const GET_OVERRIDES = gql`
  query Overrides(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    overrides(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          active
          endTime
          hosts
          id
          modificationTime
          nvt {
            id
            name
          }
          port
          severity
          newSeverity
          task {
            id
            name
          }
          text
        }
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
`;

export const useLazyGetOverrides = (variables, options) => {
  const [queryOverrides, {data, ...other}] = useLazyQuery(GET_OVERRIDES, {
    ...options,
    variables,
  });
  const overrides = isDefined(data?.overrides)
    ? data.overrides.edges.map(entity => Override.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.overrides?.counts || {};
  const counts = isDefined(data?.overrides?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getOverrides = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryOverrides({...options, variables}),
    [queryOverrides],
  );
  const pageInfo = data?.overrides?.pageInfo;
  return [getOverrides, {...other, counts, overrides, pageInfo}];
};

export const GET_OVERRIDE = gql`
  query Override($id: UUID!) {
    override(id: $id) {
      id
      active
      creationTime
      endTime
      hosts
      inUse
      modificationTime
      nvt {
        id
        name
      }
      owner
      result {
        id
        name
      }
      permissions {
        name
      }
      port
      severity
      newSeverity
      task {
        id
        name
      }
      text
      userTags {
        count
        tags {
          name
          id
          value
          comment
        }
      }
      writable
    }
  }
`;

export const useGetOverride = (id, options) => {
  const {data, ...other} = useQuery(GET_OVERRIDE, {
    ...options,
    variables: {id},
  });
  const override = isDefined(data?.override)
    ? Override.fromObject(data.override)
    : undefined;
  return {override, ...other};
};

export const CREATE_OVERRIDE = gql`
  mutation createOverride($input: CreateOverrideInput!) {
    createOverride(input: $input) {
      id
    }
  }
`;

export const useCreateOverride = options => {
  const [queryCreateOverride, {data, ...other}] = useMutation(
    CREATE_OVERRIDE,
    options,
  );

  const createOverride = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateOverride({...options, variables: {input: inputObject}}).then(
        override => override?.data?.createOverride?.id,
      ),
    [queryCreateOverride],
  );
  const overrideId = data?.createOverride?.id;
  return [createOverride, {...other, id: overrideId}];
};

export const MODIFY_OVERRIDE = gql`
  mutation modifyOverride($input: ModifyOverrideInput!) {
    modifyOverride(input: $input) {
      ok
    }
  }
`;

export const useModifyOverride = options => {
  const [queryModifyOverride, data] = useMutation(MODIFY_OVERRIDE, options);
  const modifyOverride = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyOverride({...options, variables: {input: inputObject}}),
    [queryModifyOverride],
  );
  return [modifyOverride, data];
};

export const DELETE_OVERRIDES_BY_IDS = gql`
  mutation deleteOverridesByIds($ids: [UUID]!) {
    deleteOverridesByIds(ids: $ids) {
      ok
    }
  }
`;

export const useDeleteOverridesByIds = options => {
  const [queryDeleteOverridesByIds, data] = useMutation(
    DELETE_OVERRIDES_BY_IDS,
    options,
  );
  const deleteOverridesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteOverridesByIds({...options, variables: {ids}}),
    [queryDeleteOverridesByIds],
  );
  return [deleteOverridesByIds, data];
};

export const useDeleteOverride = options => {
  const [queryDeleteOverride, data] = useMutation(
    DELETE_OVERRIDES_BY_IDS,
    options,
  );
  const deleteOverride = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteOverride({...options, variables: {ids: [id]}}),
    [queryDeleteOverride],
  );
  return [deleteOverride, data];
};

export const DELETE_OVERRIDES_BY_FILTER = gql`
  mutation deleteOverridesByFilter($filterString: String!) {
    deleteOverridesByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const useDeleteOverridesByFilter = options => {
  const [queryDeleteOverridesByFilter, data] = useMutation(
    DELETE_OVERRIDES_BY_FILTER,
    options,
  );
  const deleteOverridesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteOverridesByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteOverridesByFilter],
  );
  return [deleteOverridesByFilter, data];
};

export const EXPORT_OVERRIDES_BY_FILTER = gql`
  mutation exportOverridesByFilter($filterString: String) {
    exportOverridesByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useExportOverridesByFilter = options => {
  const [queryExportOverridesByFilter] = useMutation(
    EXPORT_OVERRIDES_BY_FILTER,
    options,
  );
  const exportOverridesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportOverridesByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportOverridesByFilter, options],
  );

  return exportOverridesByFilter;
};

export const EXPORT_OVERRIDES_BY_IDS = gql`
  mutation exportOverridesByIds($ids: [UUID]!) {
    exportOverridesByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useExportOverridesByIds = options => {
  const [queryExportOverridesByIds] = useMutation(
    EXPORT_OVERRIDES_BY_IDS,
    options,
  );

  const exportOverridesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    overrideIds =>
      queryExportOverridesByIds({
        ...options,
        variables: {
          ids: overrideIds,
        },
      }),
    [queryExportOverridesByIds, options],
  );

  return exportOverridesByIds;
};

export const CLONE_OVERRIDE = gql`
  mutation cloneOverride($id: UUID!) {
    cloneOverride(id: $id) {
      id
    }
  }
`;

export const useCloneOverride = options => {
  const [queryCloneOverride, {data, ...other}] = useMutation(
    CLONE_OVERRIDE,
    options,
  );
  const cloneOverride = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneOverride({...options, variables: {id}}).then(
        result => result.data.cloneOverride.id,
      ),
    [queryCloneOverride],
  );
  const overrideId = data?.cloneOverride?.id;
  return [cloneOverride, {...other, id: overrideId}];
};
// vim: set ts=2 sw=2 tw=80:
