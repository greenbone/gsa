/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import type Response from 'gmp/http/response';
import type Model from 'gmp/models/model';
import type Tag from 'gmp/models/tag';
import {YES_VALUE} from 'gmp/parser';
import {
  type EntityType,
  getEntityType,
  pluralizeType,
} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import {type EntityCloneResponse} from 'web/entity/hooks/useEntityClone';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import {type EntitySaveResponse} from 'web/entity/hooks/useEntitySave';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TagDialog, {SELECT_MAX_RESOURCES} from 'web/pages/tags/TagDialog';

interface AddTagData {
  name: string;
  value?: string;
  entity: Model;
}

interface TagComponentRenderProps {
  add: (tagData: AddTagData) => Promise<void>;
  clone: (tag: Tag) => Promise<void>;
  create: () => void;
  delete: (tag: Tag) => Promise<void>;
  download: (tag: Tag) => Promise<void>;
  edit: (tag: Tag, options?: {}) => void;
  enable: (tag: Tag) => Promise<void>;
  disable: (tag: Tag) => Promise<void>;
  remove: (tagId: string, entity: Model) => Promise<void>;
}

interface TagComponentProps {
  children: (props: TagComponentRenderProps) => React.ReactNode;
  onAddError?: (error: Error) => void;
  onAdded?: () => void;
  onCloneError?: (error: Error) => void;
  onCloned?: (response: EntityCloneResponse) => void;
  onCreateError?: (error: Error) => void;
  onCreated?: (response: EntityCreateResponse) => void;
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
  onDisableError?: (error: Error) => void;
  onDisabled?: () => void;
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc;
  onEnableError?: (error: Error) => void;
  onEnabled?: () => void;
  onRemoveError?: (error: Error) => void;
  onRemoved?: () => void;
  onSaveError?: (error: Error) => void;
  onSaved?: (response: EntitySaveResponse) => void;
}

const RESOURCE_TYPES: EntityType[] = [
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
] as const;

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
}: TagComponentProps) => {
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);

  const [active, setActive] = useState<boolean | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const [id, setId] = useState<string | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [title, setTitle] = useState<string | undefined>();
  const [value, setValue] = useState<string | undefined>();

  const [resourceCount, setResourceCount] = useState<number | undefined>(0);
  const [resourceIds, setResourceIds] = useState<string[]>([]);
  const [resourceType, setResourceType] = useState<EntityType | undefined>();
  const [resourceTypes, setResourceTypes] = useState<EntityType[]>([]);

  const getResourceTypes = (): EntityType[] =>
    RESOURCE_TYPES.map(type =>
      capabilities.mayAccess(type) ? type : undefined,
    ).filter(isDefined<EntityType>);

  const handleEnableTag = (tag: Tag) => {
    return gmp.tag
      .enable({id: tag.id as string})
      .then(onEnabled, onEnableError);
  };

  const handleDisableTag = (tag: Tag) => {
    return gmp.tag
      .disable({id: tag.id as string})
      .then(onDisabled, onDisableError);
  };

  const handleAddTag = ({name, value, entity}: AddTagData) => {
    return gmp.tag
      .create({
        name,
        value,
        active: true,
        resourceIds: [entity.id as string],
        resourceType: getEntityType(entity),
      })
      .then(onAdded, onAddError);
  };

  const openTagDialog = async (tag?: Tag) => {
    const resourceTypesArray = getResourceTypes();

    if (isDefined(tag)) {
      const response = await gmp.tag.get({id: tag.id as string});
      const loadedTag = response.data;
      const filter =
        'rows=' + SELECT_MAX_RESOURCES + ' tag_id="' + loadedTag.id;
      const resp = (await gmp[
        pluralizeType(loadedTag.resourceType as EntityType)
      ].get({
        filter,
      })) as Response<Model[]>;
      const resources = resp.data;
      setActive(loadedTag.active === YES_VALUE);
      setComment(loadedTag.comment);
      setId(tag.id);
      setName(loadedTag.name);
      setResourceCount(loadedTag.resourceCount);
      setResourceIds(resources.map(res => res.id as string));
      setResourceType(tag.resourceType);
      setResourceTypes(resourceTypesArray);
      setTitle(_('Edit Tag {{name}}', {name: shorten(loadedTag.name)}));
      setValue(loadedTag.value);
      setDialogVisible(true);
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
    }
  };

  const closeTagDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseTagDialog = () => {
    closeTagDialog();
  };

  const openCreateTagDialog = () => {
    void openTagDialog();
  };

  const handleRemove = (tagId: string, entity: Model) => {
    return gmp.tag
      .get({id: tagId})
      .then(response => response.data)
      .then(tag =>
        gmp.tag.save({
          id: tag.id as string,
          name: tag.name as string,
          comment: tag.comment as string,
          active: tag.active === YES_VALUE,
          value: tag.value,
          resourceIds: [entity.id as string],
          resourceType: tag.resourceType as EntityType,
          resourcesAction: 'remove',
        }),
      )
      .then(onRemoved, onRemoveError);
  };

  return (
    <EntityComponent<Tag>
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
      {({save, create, download, delete: deleteFunc, clone}) => (
        <>
          {children({
            clone,
            delete: deleteFunc,
            download,
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
              resourceIds={resourceIds}
              resourceType={resourceType}
              resourceTypes={resourceTypes}
              title={title}
              value={value}
              onClose={handleCloseTagDialog}
              onSave={async d => {
                const promise = isDefined(d.id) ? save(d) : create(d);
                await promise;
                return closeTagDialog();
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

export default TagComponent;
