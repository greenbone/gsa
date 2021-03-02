/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
import {useSelector} from 'react-redux';

import _ from 'gmp/locale';

import {getEntityType, apiType, typeName} from 'gmp/utils/entitytype';
import {capitalizeFirstLetter} from 'gmp/utils/string';

import TagsDialog from 'web/entities/tagsdialog';

import {useBulkTag, ENTITY_TYPES} from 'web/graphql/tags';

import TagDialog from 'web/pages/tags/dialog';

import reducer, {updateState} from 'web/utils/stateReducer';
import PropTypes from 'web/utils/proptypes';
import SelectionType, {getEntityIds} from 'web/utils/selectiontype';
import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import {generateFilename} from 'web/utils/render';
import useUserName from 'web/utils/useUserName';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

const initialState = {
  tag: {},
  tags: [],
  tagDialogVisible: false,
};

export const BulkTagComponent = ({
  entities,
  selected,
  filter,
  selectionType,
  entitiesCounts,
  onClose,
}) => {
  const gmp = useGmp();
  const [, renewSession] = useUserSessionTimeout();
  const [{tag, tags, tagDialogVisible}, dispatch] = useReducer(
    reducer,
    initialState,
  );
  const [bulkTag] = useBulkTag();

  const entitiesType = getEntityType(entities[0]);
  // if there are no entities, BulkTagComponent is not rendered.

  const getTagsByType = useCallback(() => {
    const tagFilter = 'resource_type=' + apiType(entitiesType);

    return gmp.tags.getAll({filter: tagFilter}).then(resp => {
      const {data} = resp;
      dispatch(updateState({tags: data}));
    });
  }, [gmp.tags, entitiesType]);

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
    dispatch(updateState({tagDialogVisible: false}));
  };

  const openTagDialog = () => {
    renewSession();
    dispatch(updateState({tagDialogVisible: true}));
  };

  const handleCreateTag = data => {
    renewSession();

    return gmp.tag
      .create(data)
      .then(response => gmp.tag.get(response.data))
      .then(response => {
        const newTags = [...tags, response.data];
        dispatch(
          updateState({
            tag: response.data,
            tags: newTags,
          }),
        );
      })
      .then(closeTagDialog);
  };

  const handleCloseTagDialog = () => {
    closeTagDialog();
    renewSession();
  };

  const handleTagChange = id => {
    renewSession();
    return gmp.tag.get({id}).then(resp => {
      dispatch(updateState({tag: resp.data}));
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

export const useBulkExportEntities = () => {
  const username = useUserName();
  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const listExportFileName = userDefaultsSelector.getValueByName(
    'listexportfilename',
  );

  const bulkExportEntities = useCallback(
    ({
      entities,
      selected,
      filter,
      resourceType,
      selectionType,
      exportByFilterFunc,
      exportByIdsFunc,
      onDownload,
      onError,
    }) => {
      if (selectionType === SelectionType.SELECTION_FILTER) {
        const exportFilter = filter.all().toFilterString();
        return exportByFilterFunc(exportFilter).then(response => {
          const filename = generateFilename({
            fileNameFormat: listExportFileName,
            resourceType,
            username,
          });

          const commandName =
            'export' + capitalizeFirstLetter(resourceType) + 'ByFilter';

          const xml = response.data;
          const {exportedEntities} = xml[commandName];
          onDownload({filename, data: exportedEntities});
        }, onError);
      }
      const toExport =
        selectionType === SelectionType.SELECTION_USER
          ? getEntityIds(selected)
          : getEntityIds(entities);

      return exportByIdsFunc(toExport).then(response => {
        const filename = generateFilename({
          fileNameFormat: listExportFileName,
          resourceType,
          username,
        });

        const commandName =
          'export' + capitalizeFirstLetter(resourceType) + 'ByIds';

        const xml = response.data;
        const {exportedEntities} = xml[commandName];
        onDownload({filename, data: exportedEntities});
      }, onError);
    },
    [listExportFileName, username],
  );

  return bulkExportEntities;
};

export const useBulkDeleteEntities = () => {
  const bulkDeleteEntities = useCallback(
    ({
      selectionType,
      filter,
      selected,
      entities,
      deleteByIdsFunc,
      deleteByFilterFunc,
      onDeleted,
      onError,
    }) => {
      if (selectionType === SelectionType.SELECTION_FILTER) {
        const filterAll = filter.all().toFilterString();
        // onDeleted is refetch. If we do .then(onDeleted, onError) then
        // refetch will be done with the response. Refetch should use original
        // parameters.
        return deleteByFilterFunc(filterAll).then(() => onDeleted(), onError);
      }
      const toDelete =
        selectionType === SelectionType.SELECTION_USER
          ? getEntityIds(selected)
          : getEntityIds(entities);
      return deleteByIdsFunc(toDelete).then(() => onDeleted(), onError);
    },
    [],
  );

  return bulkDeleteEntities;
};
