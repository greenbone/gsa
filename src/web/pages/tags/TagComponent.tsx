/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {type EntityCommandParams} from 'gmp/commands/entity';
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
import {type EntityCloneResponse} from 'web/entity/hooks/useEntityClone';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import {
  useCloneTag,
  useCreateTag,
  useDeleteTag,
  useDisableTag,
  useEnableTag,
  useSaveTag,
} from 'web/hooks/use-query/tags';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import TagDialog, {SELECT_MAX_RESOURCES} from 'web/pages/tags/TagDialog';

interface AddTagData {
  name: string;
  value?: string;
  entity: Model;
}

interface CreateTagOptions {
  resourceType?: EntityType;
  resourceIds?: string[];
}

interface TagComponentRenderProps {
  add: (tagData: AddTagData) => Promise<void>;
  clone: (tag: Tag) => Promise<void>;
  create: (options?: CreateTagOptions) => void;
  delete: (tag: Tag) => Promise<void>;
  download: (tag: Tag) => Promise<void>;
  edit: (tag: Tag, options?: {}) => Promise<void> | void;
  enable: (tag: Tag) => Promise<void>;
  disable: (tag: Tag) => Promise<void>;
  remove: (tagId: string, entity: Model) => Promise<void>;
}

interface TagComponentProps {
  children: (props: TagComponentRenderProps) => React.ReactNode;
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
  onSaved?: () => void;
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

  const deleteMutation = useDeleteTag({
    onSuccess: onDeleted,
    onError: onDeleteError,
  });

  const createMutation = useCreateTag({
    onSuccess: onCreated,
    onError: onCreateError,
  });

  const saveMutation = useSaveTag({
    onSuccess: onSaved,
    onError: onSaveError,
  });

  const cloneMutation = useCloneTag({
    onSuccess: onCloned,
    onError: onCloneError,
  });

  const enableMutation = useEnableTag({
    onSuccess: onEnabled,
    onError: onEnableError,
  });

  const disableMutation = useDisableTag({
    onSuccess: onDisabled,
    onError: onDisableError,
  });

  const handleEntityDownload = useEntityDownload<Tag>(
    (entity: EntityCommandParams) => gmp.tag.export(entity),
    {
      onDownloaded,
      onDownloadError,
    },
  );

  const getResourceTypes = (): EntityType[] =>
    RESOURCE_TYPES.filter(type => capabilities.mayAccess(type));

  const handleDelete = async (tag: Tag): Promise<void> => {
    await deleteMutation.mutateAsync({id: tag.id as string, name: tag.name});
  };

  const handleClone = async (tag: Tag): Promise<void> => {
    await cloneMutation.mutateAsync({id: tag.id as string, name: tag.name});
  };

  const handleDownload = async (tag: Tag): Promise<void> => {
    if (!isDefined(tag.id)) {
      throw new Error('Tag ID is required for download');
    }
    await handleEntityDownload(tag);
  };

  const handleEnableTag = async (tag: Tag): Promise<void> => {
    await enableMutation.mutateAsync({id: tag.id as string});
    showSuccessNotification(
      '',
      _('Tag {{- name}} enabled', {
        name: tag.name || tag.id || 'unnamed',
      }),
    );
  };

  const handleDisableTag = async (tag: Tag): Promise<void> => {
    await disableMutation.mutateAsync({id: tag.id as string});
    showSuccessNotification(
      '',
      _('Tag {{- name}} disabled', {
        name: tag.name || tag.id || 'unnamed',
      }),
    );
  };

  const handleAddTag = async ({
    name,
    value,
    entity,
  }: AddTagData): Promise<void> => {
    await createMutation.mutateAsync({
      name,
      value,
      active: true,
      resourceIds: [entity.id as string],
      resourceType: getEntityType(entity),
    });
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
      setTitle(_('Edit Tag {{- name}}', {name: shorten(loadedTag.name)}));
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

  const openCreateTagDialog = (options?: CreateTagOptions) => {
    const resourceTypesArray = getResourceTypes();

    setActive(undefined);
    setComment(undefined);
    setId(undefined);
    setName(undefined);
    setResourceCount(0);
    setResourceIds(options?.resourceIds ?? []);
    setResourceType(options?.resourceType);
    setResourceTypes(resourceTypesArray);
    setDialogVisible(true);
    setTitle(undefined);
    setValue(undefined);
  };

  const handleRemove = async (tagId: string, entity: Model): Promise<void> => {
    try {
      const response = await gmp.tag.get({id: tagId});
      const tag = response.data;
      await saveMutation.mutateAsync({
        id: tag.id as string,
        name: tag.name as string,
        comment: tag.comment as string,
        active: tag.active === YES_VALUE,
        value: tag.value,
        resourceIds: [entity.id as string],
        resourceType: tag.resourceType as EntityType,
        resourcesAction: 'remove',
      });
      if (onRemoved) {
        onRemoved();
      }
    } catch (error) {
      if (onRemoveError) {
        onRemoveError(error as Error);
      }
      throw error;
    }
  };

  return (
    <>
      {children({
        clone: handleClone,
        delete: handleDelete,
        download: handleDownload,
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
            if (isDefined(d.id)) {
              await saveMutation.mutateAsync({
                ...d,
                id: d.id,
                resourceType: d.resourceType as EntityType,
              });
            } else {
              await createMutation.mutateAsync({
                ...d,
                resourceType: d.resourceType as EntityType,
              });
            }
            closeTagDialog();
          }}
        />
      )}
    </>
  );
};

export default TagComponent;
