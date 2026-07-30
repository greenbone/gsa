/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import type Response from 'gmp/http/response';
import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type User from 'gmp/models/user';
import useGmp from 'web/hooks/useGmp';
import type {RefetchIntervalFn} from 'web/queries/helpers';
import useGetEntities from 'web/queries/useGetEntities';
import useGetEntity from 'web/queries/useGetEntity';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetUsersParams {
  filter?: FilterType;
  enabled?: boolean;
}

interface UseGetUserParams {
  id: string;
  refetchInterval?: RefetchIntervalFn<User>;
}

interface UseUserMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

type IdsInput = string | string[];

interface UserCreateInput {
  access_hosts: string;
  auth_method: string;
  comment: string;
  group_ids: IdsInput;
  hosts_allow: string;
  name: string;
  password: string;
  role_ids: IdsInput;
}

interface UserSaveInput extends UserCreateInput {
  id: string;
  old_name?: string;
}

interface BulkDeleteUsersInput {
  users: User[];
  options?: {inheritor_id?: string};
}

export type UserBulkInput = User[] | FilterType;

const toIdsArgument = (value: IdsInput): string =>
  Array.isArray(value) ? value.join(',') : value;

export const useGetUsers = ({
  filter,
  enabled = true,
}: UseGetUsersParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<User>({
    gmpMethod: gmp.users.get.bind(gmp.users),
    queryId: 'get_users',
    filter,
    enabled,
    keepPreviousData: true,
  });
};

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
  return useGmpMutation<UserCreateInput, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.user.create({
        ...data,
        group_ids: toIdsArgument(data.group_ids),
        role_ids: toIdsArgument(data.role_ids),
      });
      return response.data;
    },
    invalidateQueryIds: ['get_users'],
    onSuccess,
    onError,
  });
};

export const useSaveUser = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<UserSaveInput, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.user.save({
        ...data,
        old_name: data.old_name ?? data.name,
        group_ids: toIdsArgument(data.group_ids),
        role_ids: toIdsArgument(data.role_ids),
      });
      return response.data;
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
  return useGmpMutation<{id: string}, EntityActionData>({
    gmpMethod: async ({id}: {id: string}) => {
      const response = await gmp.user.clone({id});
      return response.data;
    },
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
  return useGmpMutation<{id: string; inheritorId?: string}, void>({
    gmpMethod: ({id, inheritorId}: {id: string; inheritorId?: string}) =>
      gmp.user.delete({id, inheritorId: inheritorId ?? ''}),
    invalidateQueryIds: ['get_users', 'get_user'],
    onSuccess,
    onError,
  });
};

export const useBulkDeleteUsers = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<Response<User[]>> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<BulkDeleteUsersInput, Response<User[]>>({
    gmpMethod: ({users, options}) => gmp.users.delete(users, options),
    invalidateQueryIds: ['get_users'],
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

export const useBulkExportUsers = ({
  onSuccess,
  onError,
}: UseUserMutationCallbacks<Response<string | ArrayBuffer>> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<UserBulkInput, Response<string | ArrayBuffer>>({
    gmpMethod: (input: UserBulkInput) =>
      isFilterType(input)
        ? gmp.users.exportByFilter(input)
        : gmp.users.export(input),
    onSuccess,
    onError,
  });
};
