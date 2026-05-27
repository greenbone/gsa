/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import Filter, {ALL_FILTER, RESULTS_FILTER_FILTER} from 'gmp/models/filter';
import type Report from 'gmp/models/report';
import type ReportConfig from 'gmp/models/report-config';
import type ReportFormat from 'gmp/models/report-format';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import {type RefetchIntervalFn} from 'web/queries/helpers';
import useGetEntities from 'web/queries/useGetEntities';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetReportParams {
  id: string;
  filter?: Filter;
  refetchInterval?: number | false | RefetchIntervalFn<Report>;
}

const REPORT_FORMATS_FILTER = Filter.fromString('active=1 and trust=1 rows=-1');

export const useGetReport = ({
  id,
  filter,
  refetchInterval,
}: UseGetReportParams) => {
  const gmp = useGmp();
  const filterString = filter?.toFilterString();

  return useGetEntity<Report>({
    gmpMethod: async ({id}) => {
      return gmp.report.get({id}, {filter: filterString, details: false});
    },
    queryId: 'get_report',
    queryKeyParts: [filterString],
    id,
    refetchInterval,
  });
};

export const useGetResultsFilters = () => {
  const gmp = useGmp();

  return useGetEntities<Filter>({
    gmpMethod: gmp.filters.get.bind(gmp.filters),
    queryId: 'get_filters',
    filter: RESULTS_FILTER_FILTER,
    refetchInterval: false,
    keepPreviousData: true,
  });
};

export const useGetReportFormats = () => {
  const gmp = useGmp();

  return useGetEntities<ReportFormat>({
    gmpMethod: gmp.reportformats.get.bind(gmp.reportformats),
    queryId: 'get_report_formats',
    filter: REPORT_FORMATS_FILTER,
    refetchInterval: false,
    keepPreviousData: true,
  });
};

export const useGetReportConfigs = () => {
  const gmp = useGmp();

  return useGetEntities<ReportConfig>({
    gmpMethod: gmp.reportconfigs.get.bind(gmp.reportconfigs),
    queryId: 'get_report_configs',
    filter: ALL_FILTER,
    refetchInterval: false,
    keepPreviousData: true,
  });
};

export const useGetReportExportFileName = () => {
  const gmp = useGmp();
  const token = useSessionToken();

  return useQuery<string | undefined>({
    queryKey: ['user_settings', token, 'reportexportfilename'],
    queryFn: async () => {
      const response = await gmp.user.currentSettings();
      const settings = response.data;
      const setting = settings?.reportexportfilename;
      return isDefined(setting) ? String(setting.value) : undefined;
    },
    enabled: Boolean(token),
  });
};
