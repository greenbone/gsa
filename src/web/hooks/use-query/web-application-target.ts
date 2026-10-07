/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import {
  type WebApplicationTargetCreateParams,
  type WebApplicationTargetSaveParams,
} from 'gmp/commands/web-application-target';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useMoveToTrashCan from 'web/queries/useMoveToTrashCan';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseCreateWebApplicationTargetParams {
  onSuccess?: (data: EntityActionData) => void;
  onError?: (error: Error) => void;
}

interface UseModifyWebApplicationTargetParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateWebApplicationTarget = ({
  onSuccess,
  onError,
}: UseCreateWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useCreateMutation<WebApplicationTargetCreateParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.webapplicationtarget.create(data);
      return response.data;
    },
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onError,
    onSuccess,
  });
};

export const useSaveWebApplicationTarget = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useSaveMutation<WebApplicationTargetSaveParams>({
    gmpMethod: async data => {
      await gmp.webapplicationtarget.save(data);
    },
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onError,
    onSuccess,
  });
};

export const useDeleteWebApplicationTarget = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useMoveToTrashCan({
    gmpMethod: ({id}) => gmp.webapplicationtarget.delete({id}),
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onSuccess,
    onError,
  });
};

export const useCloneWebApplicationTarget = ({
  onError,
  onSuccess,
}: UseCreateWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useCloneMutation<EntityActionData>({
    gmpMethod: async ({id}) => {
      const response = await gmp.webapplicationtarget.clone({id});
      return response.data;
    },
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onError,
    onSuccess,
  });
};
