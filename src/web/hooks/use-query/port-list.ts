/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import {
  type PortListCommandImportParams,
  type PortListCommandCreateParams,
  type PortListCommandSaveParams,
  type PortListCommandCreatePortRangeParams,
  type PortListCommandDeletePortRangeParams,
} from 'gmp/commands/port-list';
import _ from 'gmp/locale';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UsePortListMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

interface UseGetPortListParams {
  id: string;
}

interface UseModifyPortListParams extends UseGetPortListParams {
  name?: string;
}

export const useCreatePortList = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCreateMutation<
    PortListCommandCreateParams,
    EntityActionData,
    Error
  >({
    gmpMethod: async data => {
      const response = await gmp.portlist.create(data);
      return response.data;
    },
    entityType: 'portlist',
    invalidateQueryIds: ['get_port_lists'],
    onSuccess,
    onError,
  });
};

export const useSavePortList = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<PortListCommandSaveParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.portlist.save(data);
      return response.data;
    },
    invalidateQueryIds: ['get_port_lists', 'get_port_list'],
    onSuccess,
    onError,
  });
};

export const useClonePortList = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCloneMutation<EntityActionData, Error>({
    gmpMethod: async ({id}: UseModifyPortListParams) => {
      const response = await gmp.portlist.clone({id});
      return response.data;
    },
    entityType: 'portlist',
    invalidateQueryIds: ['get_port_lists'],
    onSuccess,
    onError,
  });
};

export const useDeletePortList = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<void> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<UseModifyPortListParams, void>({
    gmpMethod: ({id}: UseModifyPortListParams) => gmp.portlist.delete({id}),
    invalidateQueryIds: ['get_port_lists', 'get_port_list'],
    successMessage: (_data, entity) =>
      _('{{- name}} deleted successfully.', {
        name: entity.name as string,
      }),
    onSuccess,
    onError,
  });
};

export const useImportPortList = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<PortListCommandImportParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.portlist.import(data);
      return response.data;
    },
    invalidateQueryIds: ['get_port_lists'],
    onSuccess,
    onError,
  });
};

export const useCreatePortRange = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<PortListCommandCreatePortRangeParams, EntityActionData>(
    {
      gmpMethod: async data => {
        const response = await gmp.portlist.createPortRange(data);
        return response.data;
      },
      invalidateQueryIds: ['get_port_lists', 'get_port_list'],
      onSuccess,
      onError,
    },
  );
};

export const useDeletePortRange = ({
  onSuccess,
  onError,
}: UsePortListMutationCallbacks<void> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<PortListCommandDeletePortRangeParams, void>({
    gmpMethod: async ({id}: PortListCommandDeletePortRangeParams) =>
      gmp.portlist.deletePortRange({id}),
    invalidateQueryIds: ['get_port_lists', 'get_port_list'],
    onSuccess,
    onError,
  });
};
