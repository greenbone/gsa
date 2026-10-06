/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import {
  type TargetCommandCreateParams,
  type TargetCommandSaveParams,
} from 'gmp/commands/target';
import _ from 'gmp/locale';
import type Target from 'gmp/models/target';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useGetEntity from 'web/queries/useGetEntity';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseTargetMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

interface UseGetTargetParams {
  id: string;
}

interface UseModifyTargetParams extends UseGetTargetParams {
  name?: string;
}

export const useGetTarget = ({id}: UseGetTargetParams) => {
  const gmp = useGmp();
  return useGetEntity<Target>({
    gmpMethod: (data: UseGetTargetParams) => gmp.target.get(data),
    queryId: 'get_targets',
    id,
  });
};

export const useCreateTarget = ({
  onSuccess,
  onError,
}: UseTargetMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCreateMutation<TargetCommandCreateParams, EntityActionData, Error>({
    gmpMethod: async data => {
      const response = await gmp.target.create(data);
      return response.data;
    },
    entityType: 'target',
    invalidateQueryIds: ['get_targets'],
    onSuccess,
    onError,
  });
};

export const useSaveTarget = ({
  onSuccess,
  onError,
}: UseTargetMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<TargetCommandSaveParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.target.save(data);
      return response.data;
    },
    invalidateQueryIds: ['get_targets', 'get_target'],
    onSuccess,
    onError,
  });
};

export const useCloneTarget = ({
  onSuccess,
  onError,
}: UseTargetMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCloneMutation<EntityActionData, Error>({
    gmpMethod: async ({id}) => {
      const response = await gmp.target.clone({id});
      return response.data;
    },
    entityType: 'target',
    invalidateQueryIds: ['get_targets'],
    onSuccess,
    onError,
  });
};

export const useDeleteTarget = ({
  onSuccess,
  onError,
}: UseTargetMutationCallbacks<void> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<UseModifyTargetParams, void>({
    gmpMethod: ({id}: UseModifyTargetParams) => gmp.target.delete({id}),
    invalidateQueryIds: ['get_targets', 'get_target'],
    successMessage: (_data, entity) =>
      _('{{- name}} deleted successfully.', {
        name: entity.name as string,
      }),
    onSuccess,
    onError,
  });
};
