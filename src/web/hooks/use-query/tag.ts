/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionResponse} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta, type XmlResponseData} from 'gmp/http/transform/fast-xml';
import type Tag from 'gmp/models/tag';
import useGmp from 'web/hooks/useGmp';
import {type RefetchIntervalFn} from 'web/queries/helpers';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useGetEntity from 'web/queries/useGetEntity';
import useGmpMutation from 'web/queries/useGmpMutation';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseGetTagParams {
  id: string;
  refetchInterval?: RefetchIntervalFn<Tag>;
}

interface UseMutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Rejection) => void;
}

interface UseCreateTagParams {
  onSuccess?: (data: EntityActionResponse) => void;
  onError?: (error: Error) => void;
}

interface UseModifyTagParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGetTag = ({id, refetchInterval}: UseGetTagParams) => {
  const gmp = useGmp();
  return useGetEntity<Tag>({
    gmpMethod: gmp.tag.get.bind(gmp.tag),
    queryId: 'get_tag',
    id,
    refetchInterval,
  });
};

export const useDeleteTag = ({onError, onSuccess}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useDeleteMutation({
    entityType: 'tag',
    gmpMethod: ({id}) => gmp.tag.delete({id}),
    invalidateQueryIds: ['get_tags'],
    onSuccess,
    onError,
  });
};

export const useEnableTag = ({
  onError,
  onSuccess,
}: UseMutationCallbacks = {}) => {
  const gmp = useGmp();
  return useGmpMutation<
    {id: string},
    Response<XmlResponseData, XmlMeta>,
    Rejection
  >({
    gmpMethod: ({id}) => gmp.tag.enable({id}),
    invalidateQueryIds: ['get_tags'],
    onSuccess,
    onError,
  });
};

export const useDisableTag = ({
  onError,
  onSuccess,
}: UseMutationCallbacks = {}) => {
  const gmp = useGmp();
  return useGmpMutation<
    {id: string},
    Response<XmlResponseData, XmlMeta>,
    Rejection
  >({
    gmpMethod: ({id}) => gmp.tag.disable({id}),
    invalidateQueryIds: ['get_tags'],
    onSuccess,
    onError,
  });
};

export const useCreateTag = ({onSuccess, onError}: UseCreateTagParams) => {
  const gmp = useGmp();
  return useCreateMutation<
    Parameters<typeof gmp.tag.create>[0],
    EntityActionResponse,
    Rejection
  >({
    entityType: 'tag',
    gmpMethod: input => gmp.tag.create(input),
    invalidateQueryIds: ['get_tags'],
    onError,
    onSuccess,
  });
};

export const useSaveTag = ({onError, onSuccess}: UseModifyTagParams) => {
  const gmp = useGmp();
  return useSaveMutation<
    Parameters<typeof gmp.tag.save>[0],
    EntityActionResponse,
    Rejection
  >({
    entityType: 'tag',
    gmpMethod: input => gmp.tag.save(input),
    invalidateQueryIds: ['get_tags'],
    onError,
    onSuccess,
  });
};

export const useCloneTag = ({onSuccess, onError}: UseCreateTagParams) => {
  const gmp = useGmp();
  return useCloneMutation<EntityActionResponse, Rejection>({
    entityType: 'tag',
    gmpMethod: ({id}) => gmp.tag.clone({id}),
    invalidateQueryIds: ['get_tags'],
    onError,
    onSuccess,
  });
};
