/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionResponse} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta, type XmlResponseData} from 'gmp/http/transform/fast-xml';
import type Filter from 'gmp/models/filter';
import {isFilter} from 'gmp/models/filter/utils';
import type Tag from 'gmp/models/tag';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseGetTagsParams {
  filter?: Filter;
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

type TagBulkInput = Tag[] | Filter;

export const useGetTags = ({filter}: UseGetTagsParams) => {
  const gmp = useGmp();
  return useGetEntities<Tag>({
    gmpMethod: gmp.tags.get.bind(gmp.tags),
    queryId: 'get_tags',
    filter,
  });
};

export const useDeleteTag = ({onError, onSuccess}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useDeleteMutation<{id: string}, void, Rejection>({
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

export const useBulkDeleteTags = ({
  onError,
  onSuccess,
}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useGmpMutation<TagBulkInput, Response<Tag[], XmlMeta>, Rejection>({
    gmpMethod: (input: TagBulkInput) => {
      return isFilter(input)
        ? gmp.tags.deleteByFilter(input)
        : gmp.tags.delete(input);
    },
    invalidateQueryIds: ['get_tags'],
    onSuccess,
    onError,
  });
};

export const useBulkExportTags = ({
  onError,
  onSuccess,
}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useGmpMutation<TagBulkInput, Response<string>, Rejection>({
    gmpMethod: (input: TagBulkInput) => {
      return isFilter(input)
        ? gmp.tags.exportByFilter(input)
        : gmp.tags.export(input);
    },
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
