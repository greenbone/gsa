/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';
import Audit from 'gmp/models/audit';

export const CREATE_AUDIT = gql`
  mutation createAudit($input: CreateAuditInput!) {
    createAudit(input: $input) {
      id
    }
  }
`;

export const useCreateAudit = options => {
  const [queryCreateAudit, {data, ...other}] = useMutation(
    CREATE_AUDIT,
    options,
  );
  const createAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateAudit({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createAudit?.id,
      ),
    [queryCreateAudit],
  );
  const auditId = data?.createAudit?.id;
  return [createAudit, {...other, id: auditId}];
};

export const MODIFY_AUDIT = gql`
  mutation modifyAudit($input: ModifyAuditInput!) {
    modifyAudit(input: $input) {
      ok
    }
  }
`;

export const useModifyAudit = options => {
  const [queryModifyAudit, data] = useMutation(MODIFY_AUDIT, options);
  const modifyAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryModifyAudit({...options, variables: {input: inputObject}}),
    [queryModifyAudit],
  );
  return [modifyAudit, data];
};

export const START_AUDIT = gql`
  mutation startAudit($id: UUID!) {
    startAudit(id: $id) {
      reportId
    }
  }
`;

export const STOP_AUDIT = gql`
  mutation stopAudit($id: UUID!) {
    stopAudit(id: $id) {
      ok
    }
  }
`;

export const RESUME_AUDIT = gql`
  mutation resumeAudit($id: UUID!) {
    resumeAudit(id: $id) {
      ok
    }
  }
`;

export const GET_AUDIT = gql`
  query Audit($id: UUID!) {
    audit(id: $id) {
      name
      id
      creationTime
      modificationTime
      averageDuration
      permissions {
        name
      }
      reports {
        lastReport {
          id
          creationTime
          scanStart
          scanEnd
          complianceCount {
            yes
            no
            incomplete
          }
        }
        currentReport {
          id
          scanStart
          creationTime
        }
        counts {
          total
          finished
        }
      }
      results {
        counts {
          current
        }
      }
      status
      progress
      target {
        name
        id
      }
      trend
      alterable
      comment
      owner
      preferences {
        autoDeleteReports
        createAssets
        createAssetsApplyOverrides
        createAssetsMinQod
        maxConcurrentNvts
        maxConcurrentHosts
      }
      schedule {
        name
        id
        icalendar
        timezone
        duration
      }
      alerts {
        name
        id
      }
      policy {
        id
        name
        trash
      }
      scanner {
        id
        name
        type
      }
      schedulePeriods
      observers {
        users
        roles {
          name
        }
        groups {
          name
        }
      }
    }
  }
`;

export const GET_AUDITS = gql`
  query Audits(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    audits(
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
          creationTime
          modificationTime
          averageDuration
          permissions {
            name
          }
          reports {
            lastReport {
              id
              creationTime
              scanStart
              scanEnd
              complianceCount {
                yes
                no
                incomplete
              }
            }
            currentReport {
              id
              scanStart
              creationTime
            }
            counts {
              total
              finished
            }
          }
          results {
            counts {
              current
            }
          }
          status
          progress
          target {
            name
            id
          }
          trend
          alterable
          comment
          owner
          preferences {
            autoDeleteReports
            createAssets
            createAssetsApplyOverrides
            createAssetsMinQod
            maxConcurrentNvts
            maxConcurrentHosts
          }
          schedule {
            name
            id
            icalendar
            timezone
            duration
          }
          alerts {
            name
            id
          }
          policy {
            id
            name
            trash
          }
          scanner {
            id
            name
            type
          }
          schedulePeriods
          observers {
            users
            roles {
              name
            }
            groups {
              name
            }
          }
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

export const useLazyGetAudits = (variables, options) => {
  const [queryAudits, {data, ...other}] = useLazyQuery(GET_AUDITS, {
    ...options,
    variables,
  });
  const audits = isDefined(data?.audits)
    ? data.audits.edges.map(entity => Audit.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.audits?.counts || {};
  const counts = isDefined(data?.audits?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getAudits = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryAudits({...options, variables}),
    [queryAudits],
  );
  const pageInfo = data?.audits?.pageInfo;
  return [getAudits, {...other, counts, audits, pageInfo}];
};

export const useGetAudit = (id, options) => {
  const {data, ...other} = useQuery(GET_AUDIT, {...options, variables: {id}});
  const audit = isDefined(data?.audit)
    ? Audit.fromObject(data.audit)
    : undefined;
  return {audit, ...other};
};

export const useStartAudit = options => {
  const [queryStartAudit, {data, ...other}] = useMutation(START_AUDIT, options);
  const startAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryStartAudit({...options, variables: {id}}).then(
        result => result.data.startAudit.reportId,
      ),
    [queryStartAudit],
  );
  const reportId = data?.startAudit?.reportId;
  return [startAudit, {...other, reportId}];
};

export const useStopAudit = options => {
  const [queryStopAudit, data] = useMutation(STOP_AUDIT, options);
  const stopAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryStopAudit({...options, variables: {id}}),
    [queryStopAudit],
  );
  return [stopAudit, data];
};

export const useResumeAudit = options => {
  const [queryResumeAudit, data] = useMutation(RESUME_AUDIT, options);
  const resumeAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryResumeAudit({...options, variables: {id}}),
    [queryResumeAudit],
  );
  return [resumeAudit, data];
};

export const CLONE_AUDIT = gql`
  mutation cloneAudit($id: UUID!) {
    cloneAudit(id: $id) {
      id
    }
  }
`;

export const useCloneAudit = options => {
  const [queryCloneAudit, {data, ...other}] = useMutation(CLONE_AUDIT, options);
  const cloneAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneAudit({...options, variables: {id}}).then(
        result => result.data.cloneAudit.id,
      ),
    [queryCloneAudit],
  );
  const policyId = data?.cloneAudit?.id;
  return [cloneAudit, {...other, id: policyId}];
};

export const DELETE_AUDITS_BY_IDS = gql`
  mutation deleteAuditsByIds($ids: [UUID]!) {
    deleteAuditsByIds(ids: $ids) {
      ok
    }
  }
`;

export const useDeleteAudit = options => {
  const [queryDeleteAudit, data] = useMutation(DELETE_AUDITS_BY_IDS, options);
  const deleteAudit = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryDeleteAudit({...options, variables: {ids: [id]}}),
    [queryDeleteAudit],
  );
  return [deleteAudit, data];
};

export const EXPORT_AUDITS_BY_IDS = gql`
  mutation exportAuditsByIds($ids: [UUID]!) {
    exportAuditsByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const useExportAuditsByIds = options => {
  const [queryExportAuditsByIds] = useMutation(EXPORT_AUDITS_BY_IDS, options);

  const exportAuditsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    auditIds =>
      queryExportAuditsByIds({
        ...options,
        variables: {
          ids: auditIds,
        },
      }),
    [queryExportAuditsByIds, options],
  );

  return exportAuditsByIds;
};

export const EXPORT_AUDITS_BY_FILTER = gql`
  mutation exportAuditsByFilter($filterString: String) {
    exportAuditsByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useExportAuditsByFilter = options => {
  const [queryExportAuditsByFilter] = useMutation(
    EXPORT_AUDITS_BY_FILTER,
    options,
  );
  const exportAuditsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportAuditsByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportAuditsByFilter, options],
  );

  return exportAuditsByFilter;
};

export const useDeleteAuditsByIds = options => {
  const [queryDeleteAuditsByIds, data] = useMutation(
    DELETE_AUDITS_BY_IDS,
    options,
  );
  const deleteAuditsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    (ids, options) => queryDeleteAuditsByIds({...options, variables: {ids}}),
    [queryDeleteAuditsByIds],
  );
  return [deleteAuditsByIds, data];
};

export const DELETE_AUDITS_BY_FILTER = gql`
  mutation deleteAuditsByFilter($filterString: String!) {
    deleteAuditsByFilter(filterString: $filterString) {
      ok
    }
  }
`;

export const useDeleteAuditsByFilter = options => {
  const [queryDeleteAuditsByFilter, data] = useMutation(
    DELETE_AUDITS_BY_FILTER,
    options,
  );
  const deleteAuditsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    (filterString, options) =>
      queryDeleteAuditsByFilter({
        ...options,
        variables: {filterString},
      }),
    [queryDeleteAuditsByFilter],
  );
  return [deleteAuditsByFilter, data];
};
