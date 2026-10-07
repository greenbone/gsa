/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import {
  type OciImageTargetCreateParams,
  type OciImageTargetSaveParams,
} from 'gmp/commands/oci-image-target';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useMoveToTrashCan from 'web/queries/useMoveToTrashCan';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseCreateOciImageTargetParams {
  onSuccess?: (data: EntityActionData) => void;
  onError?: (error: Error) => void;
}

interface UseModifyOciImageTargetParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateOciImageTarget = ({
  onSuccess,
  onError,
}: UseCreateOciImageTargetParams) => {
  const gmp = useGmp();

  return useCreateMutation<OciImageTargetCreateParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.ociimagetarget.create(data);
      return response.data;
    },
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

  return useSaveMutation<OciImageTargetSaveParams>({
    gmpMethod: async data => {
      await gmp.ociimagetarget.save(data);
    },
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
    gmpMethod: ({id}) => gmp.ociimagetarget.delete({id}),
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
  const gmp = useGmp();

  return useCloneMutation<EntityActionData>({
    gmpMethod: async ({id}) => {
      const response = await gmp.ociimagetarget.clone({id});
      return response.data;
    },
    entityType: 'ociimagetarget',
    invalidateQueryIds: ['get_oci_image_targets'],
    onError,
    onSuccess,
  });
};
