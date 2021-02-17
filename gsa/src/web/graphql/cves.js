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

import {
  gql,
  useApolloClient,
  useLazyQuery,
  useMutation,
  useQuery,
} from '@apollo/client';
import Cve from 'gmp/models/scanconfig';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {isDefined} from 'gmp/utils/identity';

export const GET_CVE = gql`
  query Cve($id: String!) {
    cve(id: $id) {
      id
      name
      comment
      writable
      owner
      inUse
      creationTime
      modificationTime
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
      updateTime
      cvssVector
      score
      cvssV2Vector {
        accessVector
        accessComplexity
        authentication
        confidentiality
        integrity
        availability
        baseScore
        vector
      }
      cvssV3Vector {
        attackVector
        attackComplexity
        privilegesRequired
        userInteraction
        scope
        confidentiality
        integrity
        availability
        baseScore
        vector
      }
      certRefs {
        type
        name
        title
      }
      nvtRefs {
        id
        name
      }
      description
      products
    }
  }
`;

export const GET_CVES = gql`
  query Cves($filterString: FilterString) {
    cves(filterString: $filterString) {
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
          updateTime
          cvssVector
          score
          cvssV2Vector {
            accessVector
            accessComplexity
            authentication
            confidentiality
            integrity
            availability
            baseScore
            vector
          }
          cvssV3Vector {
            attackVector
            attackComplexity
            privilegesRequired
            userInteraction
            scope
            confidentiality
            integrity
            availability
            baseScore
            vector
          }
          certRefs {
            type
            name
            title
          }
          nvtRefs {
            id
            name
          }
          description
          products
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

export const EXPORT_CVES_BY_IDS = gql`
  mutation exportCvesByIds($ids: [String]!) {
    exportCvesByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const EXPORT_CVES_BY_FILTER = gql`
  mutation exportCvesByFilter($filterString: String) {
    exportCvesByFilter(filterString: $filterString) {
      exportedEntities
    }
  }
`;

export const useExportCvesByFilter = options => {
  const [queryExportCvesByFilter] = useMutation(EXPORT_CVES_BY_FILTER, options);
  const exportCvesByFilter = useCallback(
    // eslint-disable-next-line no-shadow
    filterString =>
      queryExportCvesByFilter({
        ...options,
        variables: {
          filterString,
        },
      }),
    [queryExportCvesByFilter, options],
  );

  return exportCvesByFilter;
};

export const useLazyGetCve = (id, options) => {
  const [queryCve, {data, ...other}] = useLazyQuery(GET_CVE, {
    ...options,
    variables: {id},
  });
  const cve = isDefined(data?.cve) ? Cve.fromObject(data.cve) : undefined;

  const loadCve = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryCve({...options, variables: {id}}),
    [queryCve],
  );
  return [loadCve, {cve, ...other}];
};

export const useLazyGetCves = (variables, options) => {
  const [queryCves, {data, ...other}] = useLazyQuery(GET_CVES, {
    ...options,
    variables,
  });
  const cves = isDefined(data?.cves)
    ? data.cves.edges.map(entity => Cve.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.cves?.counts || {};
  const counts = isDefined(data?.cves?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getCves = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryCves({...options, variables}),
    [queryCves],
  );
  const pageInfo = data?.cves?.pageInfo;
  return [getCves, {...other, counts, cves, pageInfo}];
};

export const useGetCve = (id, options) => {
  const {data, ...other} = useQuery(GET_CVE, {
    ...options,
    variables: {id},
  });
  const cve = isDefined(data?.cve) ? Cve.fromObject(data.cve) : undefined;
  return {cve, ...other};
};

export const useExportCvesByIds = options => {
  const [queryExportCvesByIds] = useMutation(EXPORT_CVES_BY_IDS, options);

  const exportCvesByIds = useCallback(
    // eslint-disable-next-line no-shadow
    cveIds =>
      queryExportCvesByIds({
        ...options,
        variables: {
          ids: cveIds,
        },
      }),
    [queryExportCvesByIds, options],
  );

  return exportCvesByIds;
};

export const useLoadCvePromise = () => {
  const client = useApolloClient();

  const loadCve = configId =>
    client
      .query({
        query: GET_CVE,
        variables: {id: configId},
        fetchPolicy: 'no-cache', // do not cache, since this is used when a change is saved
      })
      .then(response => {
        const cve = Cve.fromObject(response?.data?.cve);

        return cve;
      });

  return loadCve;
};
