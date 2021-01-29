/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import React, {useState} from 'react';

import _ from 'gmp/locale';

import {isDefined, hasValue} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {first} from 'gmp/utils/array';
import {pluralizeType, typeName} from 'gmp/utils/entitytype';

import EntityComponent from 'web/entity/component';

import {
  useCreateTag,
  useModifyTag,
  useToggleTag,
  useRemoveTag,
  ENTITY_TYPES,
  RESOURCES_ACTION,
} from 'web/graphql/tags';

import TagDialog from 'web/pages/tags/dialog';

import PropTypes from 'web/utils/proptypes';
import useGmp from 'web/utils/useGmp';
import useCapabilities from 'web/utils/useCapabilities';

export const SELECT_MAX_RESOURCES = 200; // concerns items in TagDialog's Select
export const MAX_RESOURCES = 40; // concerns listing in "Assigned Resources" tab

const TYPES = [
  'alert',
  'host',
  'operatingsystem',
  'cpe',
  'credential',
  'cve',
  'certbund',
  'dfncert',
  'filter',
  'group',
  'note',
  'nvt',
  'ovaldef',
  'override',
  'permission',
  'portlist',
  'report',
  'reportformat',
  'result',
  'role',
  'scanconfig',
  'scanner',
  'schedule',
  'target',
  'task',
  'tlscertificate',
  'user',
];

const TagComponent = ({
  children,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onEnabled,
  onEnableError,
  onDeleted,
  onDeleteError,
  onDisabled,
  onDisableError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onRemoved,
  onRemoveError,
  onSaved,
  onSaveError,
}) => {
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const [createTag] = useCreateTag();
  const [modifyTag] = useModifyTag();
  const [toggleTag] = useToggleTag();
  const [removeTag] = useRemoveTag();

  const [state, setState] = useState({dialogVisible: false});

  const handleEnableTag = tag => {
    handleInteraction();
    toggleTag(tag, true).then(onEnabled, onEnableError);
  };

  const handleDisableTag = tag => {
    handleInteraction();

    toggleTag(tag, false).then(onDisabled, onDisableError);
  };

  const getResourceTypes = () => {
    return TYPES.map(type =>
      capabilities.mayAccess(type) ? [type, typeName(type)] : undefined,
    ).filter(isDefined);
  };

  const openTagDialog = (tag, options = {}) => {
    const resource_types = getResourceTypes();

    if (isDefined(tag)) {
      gmp.tag.get({id: tag.id}).then(response => {
        const {
          active,
          comment,
          id,
          name,
          resourceCount,
          resourceType,
          value,
        } = response.data;
        const filter = 'rows=' + SELECT_MAX_RESOURCES + ' tag_id="' + id;
        gmp[pluralizeType(resourceType)].get({filter}).then(resp => {
          const resources = resp.data;
          setState(prevState => ({
            ...prevState,
            active,
            comment,
            dialogVisible: true,
            id,
            name,
            resourceCount,
            resourceIds: resources.map(res => res.id),
            resource_type: isDefined(resourceType)
              ? resourceType
              : first(resource_types, [])[0],
            resource_types,
            resources_action:
              resourceCount <= SELECT_MAX_RESOURCES ? undefined : 'add',
            title: _('Edit Tag {{name}}', {name: shorten(name)}),
            value,
            ...options,
          }));
        });
      });
    } else {
      setState(prevState => ({
        ...prevState,
        active: undefined,
        comment: undefined,
        id: undefined,
        name: undefined,
        resourceCount: 0,
        resourceIds: [],
        resource_type: undefined,
        resource_types,
        dialogVisible: true,
        title: undefined,
        value: undefined,
        ...options,
      }));
    }

    handleInteraction();
  };

  const closeTagDialog = () => {
    setState(prevState => ({...prevState, dialogVisible: false}));
  };

  const handleCloseTagDialog = () => {
    closeTagDialog();
    handleInteraction();
  };

  const openCreateTagDialog = (options = {}) => {
    openTagDialog(undefined, options);
  };

  const handleRemove = (tag_id, entity) => {
    handleInteraction();

    removeTag(tag_id, entity).then(onRemoved, onRemoveError);
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleSaveTag = ({
    id,
    name,
    comment = '',
    active,
    resource_ids = [],
    resource_type,
    resources_action,
    value = '',
  }) => {
    handleInteraction();

    if (!isDefined(id)) {
      return createTag({
        name,
        resourceType: ENTITY_TYPES[resource_type],
        comment,
        resourceIds: resource_ids,
        value,
        active,
      })
        .then(onCreated, onCreateError)
        .then(closeTagDialog);
    }
    return modifyTag({
      id,
      name,
      comment,
      active,
      value,
      resourceAction: hasValue(resources_action)
        ? RESOURCES_ACTION[resources_action]
        : null,
      resourceType: hasValue(resource_type)
        ? ENTITY_TYPES[resource_type]
        : null,
      resourceIds: resource_ids,
    })
      .then(onSaved, onSaveError)
      .then(closeTagDialog);
  };

  const {
    active,
    comment,
    id,
    name,
    resourceIds,
    resource_type,
    resource_types = [],
    resourceCount,
    dialogVisible,
    title,
    value,
    ...options
  } = state;

  return (
    <EntityComponent
      name="tag"
      onCreated={onCreated}
      onCreateError={onCreateError}
      onCloned={onCloned}
      onCloneError={onCloneError}
      onDeleted={onDeleted}
      onDeleteError={onDeleteError}
      onDownloaded={onDownloaded}
      onDownloadError={onDownloadError}
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openCreateTagDialog,
            edit: openTagDialog,
            enable: handleEnableTag,
            disable: handleDisableTag,
            remove: handleRemove,
            save: handleSaveTag,
          })}
          {dialogVisible && (
            <TagDialog
              active={active}
              comment={comment}
              id={id}
              name={name}
              resource_ids={resourceIds}
              resource_type={resource_type}
              resource_types={resource_types}
              resourceCount={resourceCount}
              title={title}
              value={value}
              onClose={handleCloseTagDialog}
              onSave={handleSaveTag}
              {...options}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

TagComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onAddError: PropTypes.func,
  onAdded: PropTypes.func,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDisableError: PropTypes.func,
  onDisabled: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onEnableError: PropTypes.func,
  onEnabled: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onRemoveError: PropTypes.func,
  onRemoved: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default TagComponent;

// vim: set ts=2 sw=2 tw=80:
