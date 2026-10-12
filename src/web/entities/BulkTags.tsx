/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import type Model from 'gmp/models/model';
import {apiType, type EntityType, getEntityType} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import TagsDialog, {type TagsDialogData} from 'web/entities/TagsDialog';
import {useCreateTag, useGetTag, useSaveTag} from 'web/hooks/use-query/tag';
import {useGetTags} from 'web/hooks/use-query/tags';
import useTranslation from 'web/hooks/useTranslation';
import TagDialog, {type TagDialogState} from 'web/pages/tags/TagDialog';
import SelectionType, {type SelectionTypeType} from 'web/utils/selection-type';

interface BulkTagsProps<TEntity extends Model> {
  entities: TEntity[] | undefined;
  selectedEntities: TEntity[] | undefined;
  filter: FilterType;
  selectionType: SelectionTypeType;
  entitiesCounts: CollectionCounts | undefined;
  onClose: () => void;
}

const getEntityIds = <TEntity extends Model>(entityArray: TEntity[] = []) =>
  entityArray.map(entity => entity.id as string);

const getMultiTagEntitiesCount = <TEntity extends Model>(
  pageEntities: TEntity[],
  counts: CollectionCounts | undefined,
  selectedEntities: TEntity[] | Set<TEntity>,
  selectionType: SelectionTypeType,
) => {
  if (selectionType === SelectionType.SELECTION_USER) {
    // support set and array
    return isDefined((selectedEntities as Set<TEntity>)?.size)
      ? (selectedEntities as Set<TEntity>).size
      : (selectedEntities as TEntity[]).length;
  }

  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    return pageEntities.length;
  }

  return counts?.filtered ?? 0;
};

const BulkTags = <TEntity extends Model>({
  entities = [],
  selectedEntities = [],
  filter,
  selectionType,
  entitiesCounts,
  onClose,
}: BulkTagsProps<TEntity>) => {
  const [_] = useTranslation();
  const [tagId, setTagId] = useState<string>();
  const [tagDialogVisible, setTagDialogVisible] = useState(false);
  const [error, setError] = useState<Error>();

  if (entities.length === 0) {
    return null;
  }

  const entitiesType = getEntityType(entities[0]);
  const tagFilter = QueryFilter.fromString(
    `resource_type=${apiType(entitiesType)}`,
  ).all();

  const {
    data,
    refetch: refetchTags,
    error: tagsError,
  } = useGetTags({
    filter: tagFilter,
  });
  const tags = data?.entities ?? [];

  const {data: tag, error: tagError} = useGetTag({id: tagId});

  const useCreateTagMutation = useCreateTag({
    onError: setError,
  });
  const useSaveTagMutation = useSaveTag({
    onError: setError,
  });

  const multiTagEntitiesCount = getMultiTagEntitiesCount(
    entities,
    entitiesCounts,
    selectedEntities,
    selectionType,
  );

  const closeTagDialog = useCallback(() => {
    setTagDialogVisible(false);
  }, []);

  const openTagDialog = useCallback(() => {
    setTagDialogVisible(true);
  }, []);

  const handleCreateTag = useCallback(
    async (data: TagDialogState) => {
      const response = await useCreateTagMutation.mutateAsync({
        active: data.active,
        comment: data.comment,
        name: data.name as string,
        resourceIds: data.resourceIds,
        resourceType: data.resourceType as EntityType,
        value: data.value as string,
      });
      await refetchTags();
      setTagId(response.data.id);
      closeTagDialog();
    },
    [closeTagDialog, useCreateTagMutation, refetchTags],
  );

  const handleCloseTagDialog = useCallback(() => {
    closeTagDialog();
  }, [closeTagDialog]);

  const handleTagChange = useCallback((id: string) => {
    setTagId(id);
  }, []);

  const handleCloseTagsDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleErrorClose = useCallback(() => {
    setError(undefined);
  }, []);

  const handleAddMultiTag = useCallback(
    async ({comment, id, name, value = ''}: TagsDialogData) => {
      let tagEntitiesIds: string[] | undefined = undefined;
      let loadedFilter: string | undefined = undefined;

      if (selectionType === SelectionType.SELECTION_USER) {
        tagEntitiesIds = getEntityIds(selectedEntities);
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        tagEntitiesIds = getEntityIds(entities);
      } else {
        loadedFilter = filter.all().toFilterString();
      }
      await useSaveTagMutation.mutateAsync({
        active: true,
        comment,
        filter: loadedFilter,
        id: id as string,
        name: name as string,
        resourceIds: tagEntitiesIds,
        resourceType: entitiesType,
        resourcesAction: 'add',
        value,
      });
      onClose();
    },
    [
      entities,
      entitiesType,
      filter,
      onClose,
      selectedEntities,
      selectionType,
      useSaveTagMutation,
    ],
  );

  const resourceTypes = [entitiesType];

  let title: string;
  if (selectionType === SelectionType.SELECTION_USER) {
    title = _('Add Tag to Selection');
  } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    title = _('Add Tag to Page Contents');
  } else {
    title = _('Add Tag to All Filtered');
  }

  return (
    <>
      <TagsDialog
        comment={tag?.comment}
        entitiesCount={multiTagEntitiesCount}
        error={tagError ?? tagsError ?? error}
        name={tag?.name}
        tagId={tag?.id}
        tags={tags}
        title={title}
        value={tag?.value}
        onClose={handleCloseTagsDialog}
        onErrorClose={handleErrorClose}
        onNewTagClick={openTagDialog}
        onSave={handleAddMultiTag}
        onTagChanged={handleTagChange}
      />
      {tagDialogVisible && (
        <TagDialog
          fixed={true}
          resourceIds={selectedEntities.map(entity => entity.id as string)}
          resourceType={entitiesType}
          resourceTypes={resourceTypes}
          onClose={handleCloseTagDialog}
          onSave={handleCreateTag}
        />
      )}
    </>
  );
};

export default BulkTags;
