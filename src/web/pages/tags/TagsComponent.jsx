/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {YES_VALUE} from 'gmp/parser';
import {first} from 'gmp/utils/array';
import {getEntityType, pluralizeType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TagDialog from 'web/pages/tags/Dialog';
import PropTypes from 'web/utils/PropTypes';

export const SELECT_MAX_RESOURCES = 200; // concerns items in TagDialog's Select
export const MAX_RESOURCES = 40; // concerns listing in "Assigned Resources" tab

const TYPES = [
  'alert',
  'audit',
  'auditreport',
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
  'override',
  'permission',
  'policy',
  'portlist',
  'report',
  'reportconfig',
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
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onSaved,
  onSaveError,

  onRemoved,
  onRemoveError,
  onEnabled,
  onEnableError,
  onAdded,
  onAddError,
  onDisabled,
  onDisableError,
}) => {
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);

  const [active, setActive] = useState();
  const [comment, setComment] = useState();
  const [id, setId] = useState();
  const [name, setName] = useState();
  const [title, setTitle] = useState();
  const [value, setValue] = useState();

  const [resourceCount, setResourceCount] = useState(0);
  const [resourceIds, setResourceIds] = useState([]);
  const [resourceType, setResourceType] = useState();
  const [resourceTypes, setResourceTypes] = useState([]);

  const [initialOptions, setInitialOptions] = useState({});

  const getResourceTypes = () => {
    return TYPES.map(type =>
      capabilities.mayAccess(type) ? [type, typeName(type)] : undefined,
    ).filter(isDefined);
  };

  const handleEnableTag = tag => {
    gmp.tag.enable(tag).then(onEnabled, onEnableError);
  };

  const handleDisableTag = tag => {
    gmp.tag.disable(tag).then(onDisabled, onDisableError);
  };

  const handleAddTag = ({name, value, entity}) => {
    return gmp.tag
      .create({
        name,
        value,
        active: YES_VALUE,
        resource_ids: [entity.id],
        resource_type: getEntityType(entity),
      })
      .then(onAdded, onAddError);
  };

  const openTagDialog = (tag, options = {}) => {
    const resourceTypesArray = getResourceTypes();

    if (isDefined(tag)) {
      gmp.tag.get({id: tag.id}).then(response => {
        const {active, comment, id, name, resourceCount, resourceType, value} =
          response.data;
        const filter = 'rows=' + SELECT_MAX_RESOURCES + ' tag_id="' + id;
        gmp[pluralizeType(resourceType)].get({filter}).then(resp => {
          const resources = resp.data;

          setActive(active);
          setComment(comment);
          setDialogVisible(true);
          setId(id);
          setName(name);
          setResourceCount(resourceCount);
          setResourceIds(resources.map(res => res.id));
          setResourceType(
            isDefined(resourceType)
              ? resourceType
              : first(resourceTypesArray, [])[0],
          );
          setResourceTypes(resourceTypesArray);

          setTitle(_('Edit Tag {{name}}', {name: shorten(name)}));
          setValue(value);
          setInitialOptions(options);
        });
      });
    } else {
      setActive(undefined);
      setComment(undefined);
      setId(undefined);
      setName(undefined);
      setResourceCount(0);
      setResourceIds([]);
      setResourceType(undefined);
      setResourceTypes(resourceTypesArray);
      setDialogVisible(true);
      setTitle(undefined);
      setValue(undefined);
      setInitialOptions(options);
    }
  };

  const closeTagDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseTagDialog = () => {
    closeTagDialog();
  };

  const openCreateTagDialog = (options = {}) => {
    openTagDialog(undefined, options);
  };

  const handleRemove = (tagId, entity) => {
    return gmp.tag
      .get({id: tagId})
      .then(response => response.data)
      .then(tag =>
        gmp.tag.save({
          ...tag,
          resource_id: entity.id,
          resource_type: tag.resourceType,
          resources_action: 'remove',
        }),
      )
      .then(onRemoved, onRemoveError);
  };

  return (
    <EntityComponent
      name="tag"
      onCloneError={onCloneError}
      onCloned={onCloned}
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, create, ...other}) => (
        <>
          {children({
            ...other,
            add: handleAddTag,
            create: openCreateTagDialog,
            edit: openTagDialog,
            enable: handleEnableTag,
            disable: handleDisableTag,
            remove: handleRemove,
          })}
          {dialogVisible && (
            <TagDialog
              active={active}
              comment={comment}
              id={id}
              name={name}
              resourceCount={resourceCount}
              resource_ids={resourceIds}
              resource_type={resourceType}
              resource_types={resourceTypes}
              title={title}
              value={value}
              onClose={handleCloseTagDialog}
              onSave={d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                return promise.then(() => closeTagDialog());
              }}
              {...initialOptions}
            />
          )}
        </>
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
  onRemoveError: PropTypes.func,
  onRemoved: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default TagComponent;
