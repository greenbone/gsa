/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type Vulnerability from 'gmp/models/vulnerability';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetVulnerabilitiesParams {
  filter?: FilterType;
}

interface UseMutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

type VulnBulkInput = Vulnerability[] | FilterType;

export const useGetVulnerabilities = ({
  filter,
}: UseGetVulnerabilitiesParams) => {
  const gmp = useGmp();
  return useGetEntities<Vulnerability>({
    gmpMethod: gmp.vulns.get.bind(gmp.vulns),
    queryId: 'get_vulns',
    filter,
    keepPreviousData: true,
  });
};

export const useBulkDeleteVulnerabilities = ({
  onError,
  onSuccess,
}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useGmpMutation<
    VulnBulkInput,
    Response<Vulnerability[], XmlMeta>,
    Rejection
  >({
    gmpMethod: (input: VulnBulkInput) => {
      return isFilterType(input)
        ? gmp.vulns.deleteByFilter(input)
        : gmp.vulns.delete(input);
    },
    invalidateQueryIds: ['get_vulns'],
    onSuccess,
    onError,
  });
};

export const useBulkExportVulnerabilities = ({
  onError,
  onSuccess,
}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useGmpMutation<VulnBulkInput, Response<string>, Rejection>({
    gmpMethod: (input: VulnBulkInput) => {
      return isFilterType(input)
        ? gmp.vulns.exportByFilter(input)
        : gmp.vulns.export(input);
    },
    onSuccess,
    onError,
  });
};
