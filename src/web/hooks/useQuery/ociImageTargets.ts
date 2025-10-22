/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionResponse} from 'gmp/commands/entity';
import {
  type OciImageTargetCreateParams,
  type OciImageTargetSaveParams,
} from 'gmp/commands/ociImageTarget';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta, type XmlResponseData} from 'gmp/http/transform/fastxml';
import type Filter from 'gmp/models/filter';
import {isFilter} from 'gmp/models/filter/utils';
import type OciImageTarget from 'gmp/models/ociImageTarget';
import {typeName} from 'gmp/utils/entitytype';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';
import useMoveToTrashCan from 'web/queries/useMoveToTrashCan';
import useSaveMutation from 'web/queries/useSaveMutation';

type OciImageTargetBulkInput = OciImageTarget[] | Filter;

interface UseCreateOciImageTargetParams {
  onSuccess?: (data: EntityActionResponse) => void;
  onError?: (error: Error) => void;
}

interface UseModifyOciImageTargetParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGetOciImageTargets = ({filter}: {filter?: Filter}) => {
  const gmp = useGmp();

  return useGetEntities<OciImageTarget>({
    queryId: 'get_oci_image_targets',
    filter,
    gmpMethod: gmp.ociimagetargets.get.bind(gmp.ociimagetargets),
  });
};

export const useCreateOciImageTarget = ({
  onSuccess,
  onError,
}: UseCreateOciImageTargetParams) => {
  const gmp = useGmp();

  return useCreateMutation<
    OciImageTargetCreateParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.ociimagetarget.create.bind(gmp.ociimagetarget),
    entityType: 'ociimagetarget',
    invalidateQueryIds: ['get_oci_image_targets'],
    onError,
    onSuccess,
  });
};

export const useSaveOciImageTarget = ({
  onError,
  onSuccess,
}: UseModifyOciImageTargetParams) => {
  const gmp = useGmp();

  return useSaveMutation<
    OciImageTargetSaveParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.ociimagetarget.save.bind(gmp.ociimagetarget),
    entityType: 'ociimagetarget',
    invalidateQueryIds: ['get_oci_image_targets'],
    onError,
    onSuccess,
  });
};

export const useDeleteOciImageTarget = ({
  onError,
  onSuccess,
}: UseModifyOciImageTargetParams) => {
  const gmp = useGmp();

  return useMoveToTrashCan({
    gmpMethod: gmp.ociimagetarget.delete.bind(gmp.ociimagetarget),
    entityType: 'ociimagetarget',
    invalidateQueryIds: ['get_oci_image_targets'],
    onSuccess,
    onError,
  });
};

export const useCloneOciImageTarget = ({
  onError,
  onSuccess,
}: UseCreateOciImageTargetParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();

  return useGmpMutation<{id: string}, EntityActionResponse, Rejection>({
    gmpMethod: gmp.ociimagetarget.clone.bind(gmp.ociimagetarget),
    invalidateQueryIds: ['get_oci_image_targets'],
    successMessage: _('{{entity}} successfully cloned', {
      entity: typeName('ociimagetarget'),
    }),
    onError,
    onSuccess,
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
      return isFilter(input)
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
  return useGmpMutation<
    OciImageTargetBulkInput,
    Response<XmlResponseData, XmlMeta>,
    Rejection
  >({
    gmpMethod: (input: OciImageTargetBulkInput) => {
      return isFilter(input)
        ? gmp.ociimagetargets.exportByFilter(input)
        : gmp.ociimagetargets.export(input);
    },
    onSuccess,
    onError,
  });
};
