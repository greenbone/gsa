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
import {gql, useQuery} from '@apollo/client';

import {isDefined} from 'gmp/utils/identity';
import Result from 'gmp/models/result';

export const GET_RESULT = gql`
  query Result($id: UUID!) {
    result(id: $id) {
      id
      name
      owner
      creationTime
      modificationTime
      type
      overrides {
        id
        active
        severity
        newSeverity
        text
        endTime
      }
      originResult {
        id
        details {
          name
          value
        }
      }
      report {
        id
      }
      task {
        id
        name
      }
      host {
        ip
        id
        hostname
      }
      location
      information {
        ... on ResultCVE {
          id
          severity
        }
        ... on ResultNVT {
          id
          name
          version
          score
          severities {
            type
            score
            vector
          }
          cveReferences {
            id
            type
          }
          bidReferences {
            id
            type
          }
          certReferences {
            id
            type
          }
          otherReferences {
            id
            type
          }
          tags {
            cvssBaseVector
            summary
            insight
            impact
            detectionMethod
            affected
          }
          solution {
            type
            method
            description
          }
        }
      }
      originalSeverity
      severity
      qod {
        value
        type
      }
      description
      notes {
        id
        creationTime
        modificationTime
        active
        text
      }
      tickets {
        id
      }
      userTags {
        count
        tags {
          id
          name
        }
      }
    }
  }
`;

export const useGetResult = (id, options) => {
  const {data, ...other} = useQuery(GET_RESULT, {...options, variables: {id}});
  const result = isDefined(data?.result)
    ? Result.fromObject(data.result)
    : undefined;
  return {result, ...other};
};
