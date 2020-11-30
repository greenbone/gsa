/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {gql, useLazyQuery, useMutation, useQuery} from '@apollo/client';
import ScanConfig from 'gmp/models/scanconfig';
import CollectionCounts from 'gmp/collection/collectioncounts';

import {isDefined} from 'gmp/utils/identity';

export const GET_SCAN_CONFIG = gql`
  query ScanConfig($id: UUID!) {
    scanConfig(id: $id) {
      id
      name
      comment
      writable
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
      trash
      type
      familyCount
      nvtCount
      usageType
      maxNvtCount
      knownNvtCount
      predefined
      families {
        name
        nvtCount
        maxNvtCount
        growing
      }
      preferences {
        nvt {
          oid
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
      tasks {
        name
        id
      }
      nvtSelectors {
        name
        include
        type
        familyOrNvt
      }
    }
  }
`;

export const GET_SCAN_CONFIGS = gql`
  query ScanConfigs($filterString: FilterString) {
    scanConfigs(filterString: $filterString) {
      edges {
        node {
          id
          name
          comment
          writable
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
          trash
          type
          familyCount
          nvtCount
          usageType
          maxNvtCount
          knownNvtCount
          predefined
          families {
            name
            nvtCount
            maxNvtCount
            growing
          }
          preferences {
            nvt {
              oid
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
          tasks {
            name
            id
          }
          nvtSelectors {
            name
            include
            type
            familyOrNvt
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

export const IMPORT_SCAN_CONFIG = gql`
  mutation importScanConfig($config: String) {
    importScanConfig(config: $config) {
      id
    }
  }
`;

export const CLONE_SCAN_CONFIG = gql`
  mutation cloneScanConfig($id: UUID!) {
    cloneScanConfig(id: $id) {
      id
    }
  }
`;

export const EXPORT_SCAN_CONFIGS_BY_IDS = gql`
  mutation exportScanConfigsByIds($ids: [UUID]!) {
    exportScanConfigsByIds(ids: $ids) {
      exportedEntities
    }
  }
`;

export const CREATE_SCAN_CONFIG = gql`
  mutation createScanConfig($input: CreateScanConfigInput!) {
    createScanConfig(input: $input) {
      id
    }
  }
`;

export const DELETE_SCAN_CONFIGS_BY_IDS = gql`
  mutation deleteScanConfigsByIds($ids: [UUID]!) {
    deleteScanConfigsByIds(ids: $ids) {
      ok
    }
  }
`;

export const useImportScanConfig = options => {
  const [queryImportScanConfig, {data, ...other}] = useMutation(
    IMPORT_SCAN_CONFIG,
    options,
  );
  const importScanConfig = useCallback(
    // eslint-disable-next-line no-shadow
    (config, options) =>
      queryImportScanConfig({...options, variables: {config}}).then(
        result => result.data.importScanConfig.id,
      ),
    [queryImportScanConfig],
  );
  const configId = data?.importScanConfig?.id;
  return [importScanConfig, {...other, id: configId}];
};

export const useLazyGetScanConfig = (id, options) => {
  const [queryScanConfig, {data, ...other}] = useLazyQuery(GET_SCAN_CONFIG, {
    ...options,
    variables: {id},
  });
  const scanConfig = isDefined(data?.scanConfig)
    ? ScanConfig.fromObject(data.scanConfig)
    : undefined;

  const loadScanConfig = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) => queryScanConfig({...options, variables: {id}}),
    [queryScanConfig],
  );
  return [loadScanConfig, {scanConfig, ...other}];
};

export const useLazyGetScanConfigs = (variables, options) => {
  const [queryScanConfigs, {data, ...other}] = useLazyQuery(GET_SCAN_CONFIGS, {
    ...options,
    variables,
  });
  const scanConfigs = isDefined(data?.scanConfigs)
    ? data.scanConfigs.edges.map(entity => ScanConfig.fromObject(entity.node))
    : undefined;

  const {total, filtered, offset = -1, limit, length} =
    data?.scanConfigs?.counts || {};
  const counts = isDefined(data?.scanConfigs?.counts)
    ? new CollectionCounts({
        all: total,
        filtered: filtered,
        first: offset + 1,
        length: length,
        rows: limit,
      })
    : undefined;
  const getScanConfigs = useCallback(
    // eslint-disable-next-line no-shadow
    (variables, options) => queryScanConfigs({...options, variables}),
    [queryScanConfigs],
  );
  const pageInfo = data?.scanConfigs?.pageInfo;
  return [getScanConfigs, {...other, counts, scanConfigs, pageInfo}];
};

export const useGetScanConfig = (id, options) => {
  const {data, ...other} = useQuery(GET_SCAN_CONFIG, {
    ...options,
    variables: {id},
  });
  const scanConfig = isDefined(data?.scanConfig)
    ? ScanConfig.fromObject(data.scanConfig)
    : undefined;
  return {scanConfig, ...other};
};

export const useCreateScanConfig = options => {
  const [queryCreateScanConfig, {data, ...other}] = useMutation(
    CREATE_SCAN_CONFIG,
    options,
  );
  const createScanConfig = useCallback(
    // eslint-disable-next-line no-shadow
    (inputObject, options) =>
      queryCreateScanConfig({...options, variables: {input: inputObject}}).then(
        result => result?.data?.createScanConfig?.id,
      ),
    [queryCreateScanConfig],
  );
  const scanConfigId = data?.createScanConfig?.id;
  return [createScanConfig, {...other, id: scanConfigId}];
};

export const useDeleteScanConfig = options => {
  const [queryDeleteScanConfig, data] = useMutation(
    DELETE_SCAN_CONFIGS_BY_IDS,
    options,
  );
  const deleteScanConfig = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryDeleteScanConfig({...options, variables: {ids: [id]}}),
    [queryDeleteScanConfig],
  );
  return [deleteScanConfig, data];
};

export const useExportScanConfigsByIds = options => {
  const [queryExportScanConfigsByIds] = useMutation(
    EXPORT_SCAN_CONFIGS_BY_IDS,
    options,
  );

  const exportScanConfigsByIds = useCallback(
    // eslint-disable-next-line no-shadow
    scanConfigIds =>
      queryExportScanConfigsByIds({
        ...options,
        variables: {
          ids: scanConfigIds,
        },
      }),
    [queryExportScanConfigsByIds, options],
  );

  return exportScanConfigsByIds;
};

export const useCloneScanConfig = options => {
  const [queryCloneScanConfig, {data, ...other}] = useMutation(
    CLONE_SCAN_CONFIG,
    options,
  );
  const cloneScanConfig = useCallback(
    // eslint-disable-next-line no-shadow
    (id, options) =>
      queryCloneScanConfig({...options, variables: {id}}).then(
        result => result.data.cloneScanConfig.id,
      ),
    [queryCloneScanConfig],
  );
  const scanConfigId = data?.cloneScanConfig?.id;
  return [cloneScanConfig, {...other, id: scanConfigId}];
};
