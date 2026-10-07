/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import {type FilterType} from 'gmp/models/filter';
import {isFilterType} from 'gmp/models/filter/utils';
import type Tag from 'gmp/models/tag';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetTagsParams {
  filter?: FilterType;
}

interface UseMutationCallbacks {
  onSuccess?: () => void;
  onError?: (error: Rejection) => void;
}

type TagBulkInput = Tag[] | FilterType;

export const useGetTags = ({filter}: UseGetTagsParams) => {
  const gmp = useGmp();
  return useGetEntities<Tag>({
    gmpMethod: gmp.tags.get.bind(gmp.tags),
    queryId: 'get_tags',
    filter,
  });
};

export const useBulkDeleteTags = ({
  onError,
  onSuccess,
}: UseMutationCallbacks) => {
  const gmp = useGmp();
  return useGmpMutation<TagBulkInput, Response<Tag[], XmlMeta>, Rejection>({
    gmpMethod: (input: TagBulkInput) => {
      return isFilterType(input)
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
      return isFilterType(input)
        ? gmp.tags.exportByFilter(input)
        : gmp.tags.export(input);
    },
    onSuccess,
    onError,
  });
};
