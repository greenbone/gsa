/* Copyright (C) 2021 Greenbone Networks GmbH
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
import {useCallback} from 'react';

import {gql, useLazyQuery} from '@apollo/client';

import Report from 'gmp/models/report';

import {isDefined} from 'gmp/utils/identity';

export const GET_REPORT = gql`
  query Report($id: UUID!) {
    report(id: $id) {
      id
      name
      owner
      comment
      creationTime
      modificationTime
      writable
      inUse
      task {
        id
        name
        comment
        progress
        target {
          id
          name
        }
      }
      scanRunStatus
      scanStart
      scanEnd
      hostsCount {
        total
        filtered
        current
      }
      hosts {
        ip
        id
        start
        end
        ports {
          counts {
            current
          }
        }
        results {
          counts {
            current
            high
            medium
            low
            log
            falsePositive
          }
        }
        details {
          name
          value
          source {
            type
            description
          }
          extra
        }
      }
      portsCount {
        total
        filtered
        current
      }
      ports {
        port
        host
        severity
        threat
      }
      resultsCount {
        total
        filtered
        current
        high {
          total
          filtered
          current
        }
        info {
          total
          filtered
          current
        }
        log {
          total
          filtered
          current
        }
        warning {
          total
          filtered
          current
        }
        falsePositive {
          total
          filtered
          current
        }
      }
      results {
        id
        name
        comment
        creationTime
        modificationTime
        host {
          id
        }
        port
        nvt {
          id
        }
        threat
        severity
        qod {
          value
          type
        }
      }
      closedCves {
        counts {
          total
          filtered
          current
        }
      }
      operatingSystems {
        counts {
          total
          filtered
          current
        }
      }
      applications {
        counts {
          total
          filtered
          current
        }
      }
      tlsCertificates {
        counts {
          total
          filtered
          current
        }
      }
      vulnerabilities {
        counts {
          total
          filtered
          current
        }
      }
      severity {
        total
        filtered
      }
      errors {
        counts {
          total
          filtered
          current
        }
        errors {
          host {
            name
            id
          }
          port
          description
          nvt {
            id
            name
          }
          scanNvtVersion
        }
      }
      userTags {
        count
        tags {
          name
        }
      }
      timestamp
      timezone
      timezoneAbbrev
    }
  }
`;

export const useLazyGetReport = (id, options) => {
  const [queryReport, {data, ...other}] = useLazyQuery(GET_REPORT, {
    ...options,
    variables: {id},
  });

  const report = isDefined(data?.report)
    ? Report.fromObject(data.report)
    : undefined;

  const getReport = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryReport({...options, variables}),
    [queryReport],
  );

  return [getReport, {...other, report}];
};
