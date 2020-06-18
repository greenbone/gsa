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

import {getEntityType, apiType, typeName} from 'gmp/utils/entitytype';

import TagsDialog from 'web/entities/tagsdialog';

import {useBulkTag, ENTITY_TYPES} from 'web/graphql/tags';

import TagDialog from 'web/pages/tags/dialog';

import PropTypes from 'web/utils/proptypes';
import SelectionType, {getEntityIds} from 'web/utils/selectiontype';
import useGmp from 'web/utils/useGmp';
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
  const gmp = useGmp();
  const [, renewSession] = useUserSessionTimeout();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [bulkTag] = useBulkTag();

  const getTagsByType = useCallback(
    entitiesArray => {
      if (entitiesArray.length > 0) {
        const tagFilter =
          'resource_type=' + apiType(getEntityType(entitiesArray[0]));

        return gmp.tags.getAll({filter: tagFilter}).then(resp => {
          const {data: tags} = resp;
          dispatch({type: 'setState', newState: {tags}});
        });
      }
    },
    [gmp.tags],
  );

  useEffect(() => {
    getTagsByType(entities);
  }, [getTagsByType, entities]); // replaces openTagsDialog

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
    dispatch({type: 'setState', newState: {tagDialogVisible: true}});
  };

  const handleCreateTag = data => {
    renewSession();

    return gmp.tag
      .create(data)
      .then(response => gmp.tag.get(response.data))
      .then(response => {
        const newTags = [...state.tags, response.data];
        dispatch({
          type: 'setState',
          newState: {
            tag: response.data,
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
    return gmp.tag.get({id}).then(resp => {
      dispatch({type: 'setState', newState: {tag: resp.data}});
    });
  };

  const handleCloseTagsDialog = () => {
    onClose();
    renewSession();
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

    const entitiesType = ENTITY_TYPES[getEntityType(entities[0])];

    return bulkTag(id, entitiesType, tagEntitiesIds, loadedFilter).then(
      onClose,
    );
  };

  const entitiesType = getEntityType(entities[0]);
  const resourceTypes = [[entitiesType, typeName(entitiesType)]];

  let title;
  if (selectionType === SelectionType.SELECTION_USER) {
    title = _('Add Tag to Selection');
  } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    title = _('Add Tag to Page Contents');
  } else {
    title = _('Add Tag to All Filtered');
  }

  const {tag, tags, tagDialogVisible} = state;

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
  selectionType: PropTypes.oneOf(SelectionType).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkTagComponent;
