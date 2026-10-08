/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification} from '@greenbone/ui-lib';
import {type EntityCommandParams} from 'gmp/commands/entity';
import {ExistingSettings} from 'gmp/commands/user';
import {type Meta, type default as Response} from 'gmp/http/response';
import type Model from 'gmp/models/model';
import {typeName} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import {useGetUserSetting} from 'web/hooks/use-query/user';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';
import {generateFilename, type GenerateFilenameParams} from 'web/utils/Render';

export type OnDownloadedFunc<TData = string | ArrayBuffer> = (
  data: EntityDownload<TData>,
) => void;

export interface EntityDownload<TData = string | ArrayBuffer> {
  filename: string;
  data: TData;
}

interface EntityDownloadCallbacks<TData> {
  onDownloadError?: (error: Error) => void;
  onDownloaded?: OnDownloadedFunc<TData>;
}

type EntityDownloadFunction<TData, TOptions> = (
  entity: EntityCommandParams,
  options?: TOptions,
) => Promise<Response<TData, Meta>>;

/**
 * Custom hook to handle the download of an entity.
 *
 * @param gmpMethod - A function that performs the entity download operation.
 * @param callbacks - Callbacks for handling download events.
 * @param callbacks.onDownloadError - A callback function invoked when an error occurs during the download.
 * @param callbacks.onDownloaded - A callback function invoked when the download is successful.
 *
 * @returns Function to handle the entity download.
 * @example
 * ```typescript
 * const handleDownload = useEntityDownload<MyEntity>(
 *   myGmpMethod,
 *   {
 *     onDownloadError: (error: Error) => console.error('Download failed:', error),
 *     onDownloaded: ({ filename, data }: EntityDownload) => console.log('Downloaded:', filename),
 *   }
 * );
 *
 * handleDownload(entity);
 * ```
 */
const useEntityDownload = <
  TEntity extends Model,
  TData = string | ArrayBuffer,
  TDataOptions extends object = {},
>(
  gmpMethod: EntityDownloadFunction<TData, TDataOptions>,
  {onDownloadError, onDownloaded}: EntityDownloadCallbacks<TData> = {},
) => {
  const [_] = useTranslation();
  const username = useUserName();
  const getUserSettingQuery = useGetUserSetting();

  const handleEntityDownload = async (
    entity: TEntity,
    options?: TDataOptions & GenerateFilenameParams,
  ) => {
    const detailsExportFileNameSetting = await getUserSettingQuery(
      ExistingSettings.detailsexportfilename,
    );
    const detailsExportFileName =
      (detailsExportFileNameSetting?.value as string | undefined) ?? '';

    const filename = generateFilename({
      creationTime: entity.creationTime,
      fileNameFormat: detailsExportFileName,
      id: entity.id,
      modificationTime: entity.modificationTime,
      resourceName: entity.name,
      resourceType: entity.entityType,
      username,
      ...options,
    });

    try {
      const response = await gmpMethod(entity as EntityCommandParams, options);

      if (isDefined(onDownloaded)) {
        showSuccessNotification(
          '',
          _('{{entity}} {{- name}} downloaded successfully.', {
            entity: typeName(entity.entityType),
            name: entity.name as string,
          }),
        );
        return onDownloaded({filename, data: response.data});
      }
    } catch (error) {
      if (isDefined(onDownloadError)) {
        return onDownloadError(error as Error);
      }
    }
  };
  return handleEntityDownload;
};

export default useEntityDownload;
