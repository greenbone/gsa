/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import type Cpe from 'gmp/models/cpe';
import QueryFilter from 'gmp/models/filter/query-filter';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';

interface UseGetCpeParams {
  id: string | undefined;
}

interface CpeLookupResult {
  cpe?: Cpe;
  candidateFilter?: string;
}

const getCanonicalCpeId = (id: string) => {
  const cpeParts = id.split(':');
  const version = cpeParts[4];
  const updateIndex = version?.lastIndexOf('p') ?? -1;
  const updateNumber = version?.slice(updateIndex + 1) ?? '';
  const versionNumber = version?.slice(0, updateIndex) ?? '';
  const hasNumericUpdate = /^\d+$/.test(updateNumber);

  if (
    !id.startsWith('cpe:') ||
    !version ||
    updateIndex < 1 ||
    !hasNumericUpdate ||
    !'0123456789'.includes(version[updateIndex - 1])
  ) {
    return undefined;
  }

  cpeParts[4] = `${versionNumber}:p${updateNumber}`;
  return cpeParts.join(':');
};

const getCpeSearchName = (id: string) => id.replace(/^cpe:\/[aho]:/, '');

const isNotFoundError = (error: unknown) =>
  error instanceof Error && 'status' in error && error.status === 404;

const getCpeDetail = async (gmp: ReturnType<typeof useGmp>, cpeId: string) => {
  try {
    const response = await gmp.cpe.get({id: cpeId});
    return {cpe: response.data};
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    return {error};
  }
};

const getCpeCandidateFilter = async (
  gmp: ReturnType<typeof useGmp>,
  candidateIds: string[],
) => {
  for (const candidateId of candidateIds) {
    const filter = QueryFilter.fromString(
      `name:${getCpeSearchName(candidateId)} first=1 rows=20`,
    );

    try {
      const response = await gmp.cpes.get({filter});
      if (response.data.length > 0) {
        return filter.toFilterString();
      }
    } catch {
      // Preserve the detail lookup error when candidate search fails.
    }
  }

  return undefined;
};

const getCpeById = async (gmp: ReturnType<typeof useGmp>, cpeId: string) => {
  const detailResult = await getCpeDetail(gmp, cpeId);
  if (detailResult.cpe) {
    return {cpe: detailResult.cpe};
  }

  const canonicalId = getCanonicalCpeId(cpeId);
  if (canonicalId) {
    const canonicalResult = await getCpeDetail(gmp, canonicalId);
    if (canonicalResult.cpe) {
      return {cpe: canonicalResult.cpe};
    }
  }

  if (cpeId.startsWith('cpe:')) {
    const candidateIds = [cpeId, canonicalId].filter(
      (candidateId): candidateId is string => Boolean(candidateId),
    );
    const candidateFilter = await getCpeCandidateFilter(gmp, candidateIds);
    if (candidateFilter) {
      return {candidateFilter};
    }
  }

  throw detailResult.error;
};

const useGetCpe = ({id}: UseGetCpeParams) => {
  const gmp = useGmp();
  const token = useSessionToken();

  return useQuery<CpeLookupResult>({
    enabled: Boolean(id && token),
    queryKey: ['get_cpe', token, id],
    refetchInterval: query => {
      const interval = gmp.settings.reloadInterval;
      return query.state.data?.cpe && interval > 0 ? interval : false;
    },
    retry: false,
    queryFn: async () => {
      return getCpeById(gmp, id as string);
    },
  });
};

export {getCanonicalCpeId, getCpeSearchName, useGetCpe};
export default useGetCpe;
