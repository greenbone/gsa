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

import Nvt from 'gmp/models/nvt';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {isDefined} from 'gmp/utils/identity';

export const GET_NVT = gql`
  query Nvt($id: String!) {
    nvt(id: $id) {
      id
      name
      comment
      writable
      owner
      inUse
      creationTime
      modificationTime
      updateTime
      permissions {
        name
      }
      userTags {
        count
        tags {
          id
          name
          value
          comment
        }
      }
      category
      family
      cvssBase
      qod {
        value
        type
      }
      score
      severities {
        date
        origin
        score
        type
        vector
      }
      refWarning
      refs {
        id
        type
      }
      tags {
        cvssBaseVector
        summary
        insight
        impact
        vuldetect
        affected
      }
      preferenceCount
      preferences {
        nvt {
          id
          name
        }
        hrName
        name
        id
        type
        value
        default
        alt
      }
      timeout
      defaultTimeout
      solution {
        type
        method
        description
      }
    }
  }
`;

export const GET_NVTS = gql`
  query Nvts(
    $filterString: FilterString
    $after: String
    $before: String
    $first: Int
    $last: Int
  ) {
    nvts(
      filterString: $filterString
      after: $after
      before: $before
      first: $first
      last: $last
    ) {
      edges {
        node {
          id
          name
          comment
          writable
          owner
          inUse
          creationTime
          modificationTime
          updateTime
          permissions {
            name
          }
          userTags {
            count
            tags {
              id
              name
              value
              comment
            }
          }
          category
          family
          cvssBase
          qod {
            value
            type
          }
          score
          severities {
            date
            origin
            score
            type
            vector
          }
          warning
          refs {
            id
            type
          }
          tags {
            cvssBaseVector
            summary
            insight
            impact
            vuldetect
            affected
          }
          preferenceCount
          preferences {
            nvt {
              id
              name
            }
            hrName
            name
            id
            type
            value
            default
            alt
          }
          timeout
          defaultTimeout
          solution {
            type
            method
            description
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

export const EXPORT_NVTS_BY_IDS = gql`
  mutation exportNvtsByIds($ids: [String]!) {
    exportNvtsByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const EXPORT_NVTS_BY_FILTER = gql`
  mutation exportNvtsByFilter($filterString: String) {
    exportNvtsByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useExportNvtsByFilter = options => {
  const [queryExportNvtsByFilter] = useMutation(EXPORT_NVTS_BY_FILTER, options);
  const exportNvtsByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportNvtsByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportNvtsByFilter, options],
  );

  return exportNvtsByFilter;
};

export const useExportNvtsByIds = options => {
  const [queryExportNvtsByIds] = useMutation(EXPORT_NVTS_BY_IDS, options);

  const exportNvtsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    nvtIds =>
      queryExportNvtsByIds({
        ...options,
        variables: {
          ids: nvtIds,
        },
      }),
    [queryExportNvtsByIds, options],
  );

  return exportNvtsByIds;
};

export const useLazyGetNvts = (variables, options) => {
  const [queryNvts, {data, ...other}] = useLazyQuery(GET_NVTS, {
    ...options,
    variables,
  });
  const nvts = isDefined(data?.nvts)
    ? data.nvts.edges.map(entity => Nvt.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.nvts?.counts || {};
  const counts = isDefined(data?.nvts?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getNvts = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryNvts({...options, variables}),
    [queryNvts],
  );
  const pageInfo = data?.nvts?.pageInfo;
  return [getNvts, {...other, counts, nvts, pageInfo}];
};

export const useGetNvt = (id, options) => {
  const {data, ...other} = useQuery(GET_NVT, {
    ...options,
    variables: {id},
  });
  const nvt = isDefined(data?.nvt) ? Nvt.fromObject(data.nvt) : undefined;
  return {nvt, ...other};
};
