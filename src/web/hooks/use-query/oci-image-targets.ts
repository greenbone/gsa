/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type OciImageTarget from 'gmp/models/oci-image-target';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

type OciImageTargetBulkInput = OciImageTarget[] | FilterType;

interface UseModifyOciImageTargetParams {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const useGetOciImageTargets = ({filter}: {filter?: FilterType}) => {
  const gmp = useGmp();

  return useGetEntities<OciImageTarget>({
    queryId: 'get_oci_image_targets',
    filter,
    gmpMethod: gmp.ociimagetargets.get.bind(gmp.ociimagetargets),
  });
};

export const useBulkDeleteOciImageTargets = ({
  onError,
  onSuccess,
}: UseModifyOciImageTargetParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<
    OciImageTargetBulkInput,
    Response<OciImageTarget[], XmlMeta>,
    Rejection
  >({
    gmpMethod: (input: OciImageTargetBulkInput) => {
      return isFilterType(input)
        ? gmp.ociimagetargets.deleteByFilter(input)
        : gmp.ociimagetargets.delete(input);
    },
    invalidateQueryIds: ['get_oci_image_targets'],
    successMessage: _('Container Image Targets successfully deleted'),
    onSuccess,
    onError,
  });
};

export const useBulkExportOciImageTargets = ({
  onError,
  onSuccess,
}: UseModifyOciImageTargetParams) => {
  const gmp = useGmp();
  return useGmpMutation<OciImageTargetBulkInput, Response<string>, Rejection>({
    gmpMethod: (input: OciImageTargetBulkInput) => {
      return isFilterType(input)
        ? gmp.ociimagetargets.exportByFilter(input)
        : gmp.ociimagetargets.export(input);
    },
    onSuccess,
    onError,
  });
};
