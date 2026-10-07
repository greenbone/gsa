/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionResponse} from 'gmp/commands/entity';
import {
  type OciImageTargetCreateParams,
  type OciImageTargetSaveParams,
} from 'gmp/commands/oci-image-target';
import type Rejection from 'gmp/http/rejection';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useMoveToTrashCan from 'web/queries/useMoveToTrashCan';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseCreateOciImageTargetParams {
  onSuccess?: (data: EntityActionResponse) => void;
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

  return useCloneMutation<EntityActionResponse, Rejection>({
    gmpMethod: ({id}) => gmp.ociimagetarget.clone({id}),
    entityType: 'ociimagetarget',
    invalidateQueryIds: ['get_oci_image_targets'],
    onError,
    onSuccess,
  });
};
