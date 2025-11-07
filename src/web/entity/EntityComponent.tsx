/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Model from 'gmp/models/model';
import {type EntityType} from 'gmp/utils/entity-type';
import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityCreate from 'web/entity/hooks/useEntityCreate';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload, {
  type OnDownloadedFunc,
} from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import useGmp from 'web/hooks/useGmp';

interface EntityComponentRenderProps<TEntity, TCreateData, TCreateResponse> {
  delete: (entity: TEntity) => Promise<void>;
  create: (data: TCreateData) => Promise<TCreateResponse | void>;
  clone: (entity: TEntity) => Promise<unknown>;
  download: (entity: TEntity) => Promise<void>;
  save: (entity: TEntity) => void;
}

interface EntityComponentProps<TEntity, TCreateData, TCreateResponse> {
  name: EntityType;
  children: (
    props: EntityComponentRenderProps<TEntity, TCreateData, TCreateResponse>,
  ) => React.ReactNode;
  onDownloaded?: OnDownloadedFunc;
  onDownloadError?: (error: Error) => void;
  onSaved?: (entity: TEntity) => void;
  onSaveError?: (error: Error) => void;
  onCreated?: (response: TCreateResponse) => void;
  onCreateError?: (error: Error) => void;
  onDeleted?: () => void;
  onDeleteError?: (error: Error) => void;
  onCloned?: (entity: TEntity) => void;
  onCloneError?: (error: Error) => void;
}

const EntityComponent = <
  TEntity extends Model,
  TCreateData = {},
  TCreateResponse = unknown,
>({
  children,
  name,
  onDownloaded,
  onDownloadError,
  onSaved,
  onSaveError,
  onCreated,
  onCreateError,
  onDeleted,
  onDeleteError,
  onCloned,
  onCloneError,
}: EntityComponentProps<TEntity, TCreateData, TCreateResponse>) => {
  const gmp = useGmp();
  const cmd = gmp[name];
  const handleEntityDownload = useEntityDownload(entity => cmd.export(entity), {
    onDownloadError,
    onDownloaded,
  });

  const handleEntitySave = useEntitySave(name, {
    onSaveError,
    onSaved,
  });

  const handleEntityCreate = useEntityCreate<TCreateData, TCreateResponse>(
    name,
    {
      onCreated,
      onCreateError,
    },
  );

  const handleEntityDelete = useEntityDelete(name, {
    onDeleteError,
    onDeleted,
  });

  const handleEntityClone = useEntityClone(name, {
    onCloneError,
    onCloned,
  });

  return children({
    create: handleEntityCreate,
    clone: handleEntityClone,
    delete: handleEntityDelete,
    save: handleEntitySave,
    download: handleEntityDownload,
  });
};

export default EntityComponent;
