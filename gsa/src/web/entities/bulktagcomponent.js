/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useReducer, useEffect, useCallback} from 'react';

import _ from 'gmp/locale';
import Tag from 'gmp/models/tag';

import {getEntityType, apiType, typeName} from 'gmp/utils/entitytype';

import TagsDialog from 'web/entities/tagsdialog';

import {
  useBulkTag,
  useImperativeGetTag,
  useCreateTag,
  ENTITY_TYPES,
  useImperativeGetTags,
} from 'web/graphql/tags';

import TagDialog from 'web/pages/tags/dialog';

import PropTypes from 'web/utils/proptypes';
import SelectionType, {getEntityIds} from 'web/utils/selectiontype';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const initialState = {
  tag: {},
  tags: [],
  tagDialogVisible: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'setState':
      const {newState} = action;
      return {
        ...state,
        ...newState,
      };
    default:
      return state;
  }
};

const BulkTagComponent = ({
  entities,
  selected,
  filter,
  selectionType,
  entitiesCounts,
  onClose,
}) => {
  const [, renewSession] = useUserSessionTimeout();
  const [{tag, tags, tagDialogVisible}, dispatch] = useReducer(
    reducer,
    initialState,
  );
  const [bulkTag] = useBulkTag();
  const [getTag] = useImperativeGetTag();
  const [getTags] = useImperativeGetTags();
  const [createTag] = useCreateTag();

  const entitiesType = getEntityType(entities[0]);
  // if there are no entities, BulkTagComponent is not rendered.

  const getTagsByType = useCallback(() => {
    const tagFilter = 'resource_type=' + apiType(entitiesType);

    return getTags(tagFilter).then(resp => {
      // Parse tags here. I started out parsing them in the custom hook.
      // But I anticipate once useLazyQuery returns a promise,
      // We will still need to parse them here.
      // Since waiting for the returned data/tags variable to update
      // Might happen one render too late and make the new value
      // unusable for this promise chain.
      // This way, we can simply replace useImperativeGetTags
      // with useLazyGetTags without any additional changes
      const returned = resp?.data?.tags?.edges;
      const fetchedTags = returned.map(entity => Tag.fromObject(entity.node));
      dispatch({type: 'setState', newState: {tags: fetchedTags}});
    });
  }, [getTags, entitiesType]);

  useEffect(() => {
    getTagsByType();
  }, [getTagsByType]); // replaces openTagsDialog

  const getMultiTagEntitiesCount = (
    pageEntities,
    counts,
    selectedEntities,
    selType,
  ) => {
    if (selType === SelectionType.SELECTION_USER) {
      return selectedEntities.size;
    }

    if (selType === SelectionType.SELECTION_PAGE_CONTENTS) {
      return pageEntities.length;
    }

    return counts.filtered;
  };
  const multiTagEntitiesCount = getMultiTagEntitiesCount(
    entities,
    entitiesCounts,
    selected,
    selectionType,
  );

  const closeTagDialog = () => {
    dispatch({type: 'setState', newState: {tagDialogVisible: false}});
  };

  const openTagDialog = () => {
    renewSession();
    dispatch({type: 'setState', newState: {tagDialogVisible: true}});
  };

  const handleCreateTag = ({
    name,
    comment,
    active,
    resource_type,
    resource_ids,
    value,
  }) => {
    renewSession();

    return createTag({
      name,
      comment,
      active,
      resourceType: ENTITY_TYPES[resource_type],
      resourceIds: resource_ids,
      value,
    })
      .then(id => getTag(id))
      .then(resp => {
        const newTag = Tag.fromObject(resp.data.tag);
        const newTags = [...tags, newTag];

        dispatch({
          type: 'setState',
          newState: {
            tag: newTag,
            tags: newTags,
          },
        });
      })
      .then(closeTagDialog);
  };

  const handleCloseTagDialog = () => {
    closeTagDialog();
    renewSession();
  };

  const handleTagChange = id => {
    renewSession();
    return getTag(id).then(resp => {
      dispatch({type: 'setState', newState: {tag: resp}});
    });
  };

  const handleCloseTagsDialog = () => {
    onClose();
  };

  const handleAddMultiTag = ({id}) => {
    let tagEntitiesIds;
    let loadedFilter;

    if (selectionType === SelectionType.SELECTION_USER) {
      tagEntitiesIds = getEntityIds(selected);
      loadedFilter = null;
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      tagEntitiesIds = getEntityIds(entities);
      loadedFilter = null;
    } else {
      loadedFilter = filter.all().toFilterString();
      tagEntitiesIds = null;
    }

    const resourceType = ENTITY_TYPES[entitiesType];

    return bulkTag(id, {
      resourceType,
      resourceIds: tagEntitiesIds,
      resourceFilter: loadedFilter,
    }).then(onClose);
  };

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
    <React.Fragment>
      <TagsDialog
        comment={tag.comment}
        entitiesCount={multiTagEntitiesCount}
        filter={filter}
        name={tag.name}
        tagId={tag.id}
        tags={tags}
        title={title}
        value={tag.value}
        onClose={handleCloseTagsDialog}
        onSave={handleAddMultiTag}
        onNewTagClick={openTagDialog}
        onTagChanged={handleTagChange}
      />
      {tagDialogVisible && (
        <TagDialog
          fixed={true}
          resources={selected}
          resource_type={entitiesType}
          resource_types={resourceTypes}
          onClose={handleCloseTagDialog}
          onSave={handleCreateTag}
        />
      )}
    </React.Fragment>
  );
};

BulkTagComponent.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.model).isRequired,
  entitiesCounts: PropTypes.counts.isRequired,
  filter: PropTypes.filter.isRequired,
  selected: PropTypes.arrayOf(PropTypes.model).isRequired,
  selectionType: PropTypes.oneOf([
    SelectionType.SELECTION_PAGE_CONTENTS,
    SelectionType.SELECTION_USER,
    SelectionType.SELECTION_FILTER,
  ]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkTagComponent;
