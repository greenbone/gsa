/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Response from 'gmp/http/response';
import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type User from 'gmp/models/user';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetUsersParams {
  filter?: FilterType;
  enabled?: boolean;
}

interface UseUserMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

interface BulkDeleteUsersInput {
  users: User[];
  options?: {inheritor_id?: string};
}

export type UserBulkInput = User[] | FilterType;

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
