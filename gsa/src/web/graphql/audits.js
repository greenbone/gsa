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

import {gql, useMutation, useQuery} from '@apollo/client';
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
      permissions {
        name
      }
      reports {
        lastReport {
          id
          severity
          timestamp
          scanStart
          scanEnd
        }
        currentReport {
          id
          scanStart
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
        name
        value
        description
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
        type
      }
      scanner {
        id
        name
        type
      }
      schedulePeriods
      hostsOrdering
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
