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
          active
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

export const CLONE_ALERT = gql`
  mutation cloneAlert($id: UUID!) {
    cloneAlert(id: $id) {
      id
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

export const TEST_ALERT = gql`
  mutation testAlert($id: UUID!) {
    testAlert(id: $id) {
      ok
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
