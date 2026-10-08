/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {type EntityActionData} from 'gmp/commands/entity';
import {type UserCommandDeleteParams} from 'gmp/commands/user';
import type Response from 'gmp/http/response';
import type User from 'gmp/models/user';
import useGmp from 'web/hooks/useGmp';
import useSessionToken from 'web/hooks/useSessionToken';
import {type RefetchIntervalFn} from 'web/queries/helpers';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useGetEntity from 'web/queries/useGetEntity';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetUserParams {
  id: string;
  refetchInterval?: RefetchIntervalFn<User>;
}

interface UseUserMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

interface UserCreateInput {
  accessHosts: string[];
  authMethod: string;
  comment: string;
  groupIds: string[];
  hostsAllow: string;
  name: string;
  password: string;
  roleIds: string[];
}

interface UserSaveInput extends UserCreateInput {
  id: string;
  oldName?: string;
}

interface UserDeleteInput extends UserCommandDeleteParams {
  name: string | undefined;
}

export const useGetUser = ({id, refetchInterval}: UseGetUserParams) => {
  const gmp = useGmp();
  return useGetEntity<User>({
    gmpMethod: gmp.user.get.bind(gmp.user),
    queryId: 'get_user',
    id,
    refetchInterval,
  });
};

export const useCreateUser = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCreateMutation<UserCreateInput, EntityActionData, Error>({
    gmpMethod: async data => {
      const response = await gmp.user.create(data);
      return response.data;
    },
    entityType: 'user',
    invalidateQueryIds: ['get_users'],
    onSuccess,
    onError,
  });
};

export const useSaveUser = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<void> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<UserSaveInput, void>({
    gmpMethod: async data => {
      await gmp.user.save({
        ...data,
        oldName: data.oldName ?? data.name,
      });
    },
    invalidateQueryIds: ['get_users', 'get_user'],
    onSuccess,
    onError,
  });
};

export const useCloneUser = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCloneMutation<EntityActionData, Error>({
    gmpMethod: async ({id}) => {
      const response = await gmp.user.clone({id});
      return response.data;
    },
    entityType: 'user',
    invalidateQueryIds: ['get_users'],
    onSuccess,
    onError,
  });
};

export const useDeleteUser = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<void> = {}) => {
  const gmp = useGmp();
  return useDeleteMutation<UserDeleteInput>({
    gmpMethod: ({id, inheritorId}: UserDeleteInput) =>
      gmp.user.delete({id, inheritorId}),
    entityType: 'user',
    invalidateQueryIds: ['get_users', 'get_user'],
    onSuccess,
    onError,
  });
};

export const useDownloadUser = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<Response<string | ArrayBuffer>> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<{id: string}, Response<string | ArrayBuffer>>({
    gmpMethod: (entity: {id: string}) => gmp.user.export(entity),
    onSuccess,
    onError,
  });
};

export const useGetUserSetting = () => {
  const gmp = useGmp();
  const token = useSessionToken();
  const queryClient = useQueryClient();
  return (id: string) =>
    queryClient.query({
      queryKey: ['get_user_setting', token, id],
      queryFn: async () => {
        const response = await gmp.user.getSetting(id);
        return response.data;
      },
    });
};
