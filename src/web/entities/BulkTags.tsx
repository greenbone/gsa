/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import Tag from 'gmp/models/tag';
import {apiType, type EntityType, getEntityType} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import TagsDialog, {type TagsDialogData} from 'web/entities/TagsDialog';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TagDialog, {type TagDialogState} from 'web/pages/tags/TagDialog';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

interface BulkTagsProps<TEntity extends Model> {
  entities: TEntity[];
  selectedEntities: TEntity[];
  filter: Filter;
  selectionType: SelectionTypeType;
  entitiesCounts: CollectionCounts;
  onClose: () => void;
}

const getEntityIds = <TEntity extends Model>(entityArray: TEntity[] = []) =>
  entityArray.map(entity => entity.id as string);

const getMultiTagEntitiesCount = <TEntity extends Model>(
  pageEntities: TEntity[],
  counts: CollectionCounts,
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

  return counts.filtered;
};

const BulkTags = <TEntity extends Model>({
  entities,
  selectedEntities,
  filter,
  selectionType,
  entitiesCounts,
  onClose,
}: BulkTagsProps<TEntity>) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const [tag, setTag] = useState<Tag>(new Tag());
  const [tagDialogVisible, setTagDialogVisible] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState();

  const entitiesType = getEntityType(entities[0]);
  // if there are no entities, BulkTagComponent is not rendered.

  const fetchTagsByType = useCallback(() => {
    const tagFilter = `resource_type=${apiType(entitiesType)}`;
    return gmp.tags
      .getAll({filter: tagFilter})
      .then(resp => {
        setTags(resp.data);
      })
      .catch(setError);
  }, [gmp.tags, entitiesType]);

  useEffect(() => {
    void fetchTagsByType();
  }, [fetchTagsByType]);

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
    (data: TagDialogState) => {
      return gmp.tag
        .create({
          active: data.active,
          comment: data.comment,
          name: data.name as string,
          resourceIds: data.resourceIds,
          resourceType: data.resourceType as EntityType,
          value: data.value as string,
        })
        .then(response => gmp.tag.get(response.data))
        .then(response => {
          const newTags = [...tags, response.data];
          setTags(newTags);
          setTag(response.data);
        })
        .then(closeTagDialog)
        .catch(setError);
    },
    [closeTagDialog, gmp.tag, tags],
  );

  const handleCloseTagDialog = useCallback(() => {
    closeTagDialog();
  }, [closeTagDialog]);

  const handleTagChange = useCallback(
    (id: string) => {
      return gmp.tag
        .get({id})
        .then(resp => {
          setTag(resp.data);
        })
        .catch(setError);
    },
    [gmp.tag],
  );

  const handleCloseTagsDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleErrorClose = useCallback(() => {
    setError(undefined);
  }, []);

  const handleAddMultiTag = useCallback(
    ({comment, id, name, value = ''}: TagsDialogData) => {
      let tagEntitiesIds: string[] | undefined = undefined;
      let loadedFilter: string | undefined = undefined;

      if (selectionType === SelectionType.SELECTION_USER) {
        tagEntitiesIds = getEntityIds(selectedEntities);
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        tagEntitiesIds = getEntityIds(entities);
      } else {
        loadedFilter = filter.all().toFilterString();
      }

      return gmp.tag
        .save({
          active: true,
          comment,
          filter: loadedFilter,
          id: id as string,
          name: name as string,
          resourceIds: tagEntitiesIds,
          resourceType: entitiesType,
          resourcesAction: 'add',
          value,
        })
        .then(onClose)
        .catch(setError);
    },
    [
      entities,
      entitiesType,
      filter,
      gmp.tag,
      onClose,
      selectedEntities,
      selectionType,
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
        comment={tag.comment}
        entitiesCount={multiTagEntitiesCount}
        error={error}
        name={tag.name}
        tagId={tag.id}
        tags={tags}
        title={title}
        value={tag.value}
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
