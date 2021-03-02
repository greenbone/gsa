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

import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Alert from 'gmp/models/alert';

import {isDefined} from 'gmp/utils/identity';

export const GET_ALERTS = gql`
  query Alert(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    alerts(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          name
          id
          inUse
          writable
          active
          comment
          owner
          creationTime
          modificationTime
          filter {
            trash
            name
            id
          }
          tasks {
            id
            name
          }
          event {
            type
            data {
              name
              value
            }
          }
          condition {
            type
            data {
              name
              value
            }
          }
          method {
            type
            data {
              name
              value
            }
          }
          permissions {
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        lastPageCursor
      }
      counts {
        total
        filtered
        offset
        limit
        length
      }
    }
  }
`;

export const GET_ALERT = gql`
  query Alert($id: UUID!) {
    alert(id: $id) {
      name
      id
      inUse
      writable
      active
      comment
      owner
      creationTime
      modificationTime
      filter {
        trash
        name
        id
      }
      tasks {
        id
        name
      }
      event {
        type
        data {
          name
          value
        }
      }
      condition {
        type
        data {
          name
          value
        }
      }
      method {
        type
        data {
          name
          value
        }
      }
      permissions {
        name
      }
      userTags {
        count
        tags {
          name
          id
          value
          comment
        }
      }
    }
  }
`;

export const CLONE_ALERT = gql`
  mutation cloneAlert($id: UUID!) {
    cloneAlert(id: $id) {
      id
    }
  }
`;

export const TEST_ALERT = gql`
  mutation testAlert($id: UUID!) {
    testAlert(id: $id) {
      ok
    }
  }
`;

export const DELETE_ALERTS_BY_IDS = gql`
  mutation deleteAlertsByIds($ids: [UUID]!) {
    deleteAlertsByIds(ids: $ids) {
      ok
    }
  }
`;

export const DELETE_ALERTS_BY_FILTER = gql`
  mutation deleteAlertsByFilter($filterString: String!) {
    deleteAlertsByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const EXPORT_ALERTS_BY_FILTER = gql`
  mutation exportAlertsByFilter($filterString: String) {
    exportAlertsByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const EXPORT_ALERTS_BY_IDS = gql`
  mutation exportAlertsByIds($ids: [UUID]!) {
    exportAlertsByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useLazyGetAlerts = (variables, options) => {
  const [queryAlerts, {data, ...other}] = useLazyQuery(GET_ALERTS, {
    ...options,
    variables,
  });
  const alerts = isDefined(data?.alerts)
    ? data.alerts.edges.map(entity => Alert.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.alerts?.counts || {};
  const counts = isDefined(data?.alerts?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getAlerts = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryAlerts({...options, variables}),
    [queryAlerts],
  );
  const pageInfo = data?.alerts?.pageInfo;
  return [getAlerts, {...other, counts, alerts, pageInfo}];
};

export const CREATE_ALERT = gql`
  mutation createAlert($input: CreateAlertInput!) {
    createAlert(input: $input) {
      id
    }
  }
`;

export const useCreateAlert = options => {
  const [queryCreateAlert, {data, ...other}] = useMutation(
    CREATE_ALERT,
    options,
  );
  const createAlert = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateAlert({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createAlert?.id,
      ),
    [queryCreateAlert],
  );
  const alertId = data?.createAlert?.id;
  return [createAlert, {...other, id: alertId}];
};

export const MODIFY_ALERT = gql`
  mutation modifyAlert($input: ModifyAlertInput!) {
    modifyAlert(input: $input) {
      ok
    }
  }
`;

export const useModifyAlert = options => {
  const [queryModifyAlert, data] = useMutation(MODIFY_ALERT, options);
  const modifyAlert = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyAlert({...options, variables: {input: inputObject}}),
    [queryModifyAlert],
  );
  return [modifyAlert, data];
};

export const useCloneAlert = options => {
  const [queryCloneAlert, {data, ...other}] = useMutation(CLONE_ALERT, options);
  const cloneAlert = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneAlert({...options, variables: {id}}).then(
        result => result.data.cloneAlert.id,
      ),
    [queryCloneAlert],
  );
  const alertId = data?.cloneAlert?.id;
  return [cloneAlert, {...other, id: alertId}];
};

export const useTestAlert = options => {
  const [queryTestAlert, data] = useMutation(TEST_ALERT, options);
  const testAlert = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryTestAlert({...options, variables: {id}}),
    [queryTestAlert],
  );
  return [testAlert, data];
};

export const useDeleteAlert = options => {
  const [queryDeleteAlert, data] = useMutation(DELETE_ALERTS_BY_IDS, options);
  const deleteAlert = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteAlert({...options, variables: {ids: [id]}}),
    [queryDeleteAlert],
  );
  return [deleteAlert, data];
};

export const useExportAlertsByFilter = options => {
  const [queryExportAlertsByFilter] = useMutation(
    EXPORT_ALERTS_BY_FILTER,
    options,
  );
  const exportAlertsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportAlertsByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportAlertsByFilter, options],
  );

  return exportAlertsByFilter;
};

export const useExportAlertsByIds = options => {
  const [queryExportAlertsByIds] = useMutation(EXPORT_ALERTS_BY_IDS, options);

  const exportAlertsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    alertIds =>
      queryExportAlertsByIds({
        ...options,
        variables: {
          ids: alertIds,
        },
      }),
    [queryExportAlertsByIds, options],
  );

  return exportAlertsByIds;
};

export const useDeleteAlertsByIds = options => {
  const [queryDeleteAlertsByIds, data] = useMutation(
    DELETE_ALERTS_BY_IDS,
    options,
  );
  const deleteAlertsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteAlertsByIds({...options, variables: {ids}}),
    [queryDeleteAlertsByIds],
  );
  return [deleteAlertsByIds, data];
};

export const useDeleteAlertsByFilter = options => {
  const [queryDeleteAlertsByFilter, data] = useMutation(
    DELETE_ALERTS_BY_FILTER,
    options,
  );
  const deleteAlertsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteAlertsByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteAlertsByFilter],
  );
  return [deleteAlertsByFilter, data];
};

export const useGetAlert = (id, options) => {
  const {data, ...other} = useQuery(GET_ALERT, {...options, variables: {id}});
  const alert = isDefined(data?.alert)
    ? Alert.fromObject(data.alert)
    : undefined;
  return {alert, ...other};
};
