/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type WebApplicationTarget from 'gmp/models/web-application-target';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

type WebApplicationTargetBulkInput = WebApplicationTarget[] | FilterType;

interface UseModifyWebApplicationTargetParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGetWebApplicationTargets = ({
  filter,
}: {
  filter?: FilterType;
}) => {
  const gmp = useGmp();

  return useGetEntities<WebApplicationTarget>({
    queryId: 'get_web_application_targets',
    filter,
    gmpMethod: gmp.webapplicationtargets.get.bind(gmp.webapplicationtargets),
  });
};

export const useBulkDeleteWebApplicationTargets = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<
    WebApplicationTargetBulkInput,
    Response<WebApplicationTarget[], XmlMeta>,
    Rejection
  >({
    gmpMethod: (input: WebApplicationTargetBulkInput) => {
      return isFilterType(input)
        ? gmp.webapplicationtargets.deleteByFilter(input)
        : gmp.webapplicationtargets.delete(input);
    },
    invalidateQueryIds: ['get_web_application_targets'],
    successMessage: _('Web Application Targets successfully deleted'),
    onSuccess,
    onError,
  });
};

export const useBulkExportWebApplicationTargets = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const gmp = useGmp();
  return useGmpMutation<
    WebApplicationTargetBulkInput,
    Response<string>,
    Rejection
  >({
    gmpMethod: (input: WebApplicationTargetBulkInput) => {
      return isFilterType(input)
        ? gmp.webapplicationtargets.exportByFilter(input)
        : gmp.webapplicationtargets.export(input);
    },
    onSuccess,
    onError,
  });
};
