/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useState} from 'react';

import _ from 'gmp/locale';
import {YES_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {apiType, getEntityType, typeName} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';

import useGmp from 'web/hooks/useGmp';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';

import TagDialog from 'web/pages/tags/dialog';

import TagsDialog from './tagsdialog';

const getEntityIds = (entityArray = []) => entityArray.map(entity => entity.id);

const getMultiTagEntitiesCount = (
  pageEntities,
  counts,
  selectedEntities,
  selectionType,
) => {
  if (selectionType === SelectionType.SELECTION_USER) {
    // support set and array
    return isDefined(selectedEntities?.size)
      ? selectedEntities.size
      : selectedEntities.length;
  }

  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    return pageEntities.length;
  }

  return counts.filtered;
};

const BulkTags = ({
  entities,
  selectedEntities,
  filter,
  selectionType,
  entitiesCounts,
  onClose,
}) => {
  const gmp = useGmp();
  const [, renewSession] = useUserSessionTimeout();
  const [tag, setTag] = useState({});
  const [tagDialogVisible, setTagDialogVisible] = useState(false);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState();

  const entitiesType = getEntityType(entities[0]);
  // if there are no entities, BulkTagComponent is not rendered.

  const getTagsByType = useCallback(() => {
    const tagFilter = `resource_type=${apiType(entitiesType)}`;

    return gmp.tags
      .getAll({filter: tagFilter})
      .then(resp => {
        setTags(resp.data);
      })
      .catch(setError);
  }, [gmp.tags, entitiesType]);

  useEffect(() => {
    getTagsByType();
  }, [getTagsByType]);

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
    renewSession();
    setTagDialogVisible(true);
  }, [renewSession]);

  const handleCreateTag = useCallback(
    data => {
      renewSession();

      return gmp.tag
        .create(data)
        .then(response => gmp.tag.get(response.data))
        .then(response => {
          const newTags = [...tags, response.data];
          setTags(newTags);
          setTag(response.data);
        })
        .then(closeTagDialog)
        .catch(setError);
    },
    [closeTagDialog, gmp.tag, renewSession, tags],
  );

  const handleCloseTagDialog = useCallback(() => {
    closeTagDialog();
    renewSession();
  }, [closeTagDialog, renewSession]);

  const handleTagChange = useCallback(
    id => {
      renewSession();
      return gmp.tag
        .get({id})
        .then(resp => {
          setTag(resp.data);
        })
        .catch(setError);
    },
    [renewSession, gmp.tag],
  );

  const handleCloseTagsDialog = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleErrorClose = useCallback(() => {
    setError();
  }, []);

  const handleAddMultiTag = useCallback(
    ({comment, id, name, value = ''}) => {
      let tagEntitiesIds;
      let loadedFilter;

      if (selectionType === SelectionType.SELECTION_USER) {
        tagEntitiesIds = getEntityIds(selectedEntities);
        loadedFilter = null;
      } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
        tagEntitiesIds = getEntityIds(entities);
        loadedFilter = null;
      } else {
        loadedFilter = filter.all().toFilterString();
        tagEntitiesIds = null;
      }

      return gmp.tag
        .save({
          active: YES_VALUE,
          comment,
          filter: loadedFilter,
          id,
          name,
          resource_ids: tagEntitiesIds,
          resource_type: entitiesType,
          resources_action: 'add',
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

  const resourceTypes = [[entitiesType, typeName(entitiesType)]];

  let title;
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
        errors={error}
        filter={filter}
        name={tag.name}
        tagId={tag.id}
        tags={tags}
        title={title}
        value={tag.value}
        onClose={handleCloseTagsDialog}
        onErrorClose={handleErrorClose}
        onSave={handleAddMultiTag}
        onNewTagClick={openTagDialog}
        onTagChanged={handleTagChange}
      />
      {tagDialogVisible && (
        <TagDialog
          fixed={true}
          resources={selectedEntities}
          resource_type={entitiesType}
          resource_types={resourceTypes}
          onClose={handleCloseTagDialog}
          onSave={handleCreateTag}
        />
      )}
    </>
  );
};

BulkTags.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.model).isRequired,
  entitiesCounts: PropTypes.counts.isRequired,
  filter: PropTypes.filter.isRequired,
  selectedEntities: PropTypes.arrayOf(PropTypes.model).isRequired,
  selectionType: PropTypes.oneOf([
    SelectionType.SELECTION_PAGE_CONTENTS,
    SelectionType.SELECTION_USER,
    SelectionType.SELECTION_FILTER,
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkTags;
