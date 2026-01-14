/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import {useDispatch, useSelector} from 'react-redux';
import {type EntityCommandParams} from 'gmp/commands/entity';
import {type Meta, type default as Response} from 'gmp/http/response';
import type Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
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
  const username = useSelector(getUsername);
  const dispatch = useDispatch();
  const gmp = useGmp();
  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);

  useEffect(() => {
    const detailsExportFileName = userDefaultsSelector.getValueByName(
      'detailsexportfilename',
    );
    const loadSettings = () => {
      // @ts-expect-error
      dispatch(loadUserSettingDefaults(gmp)());
    };
    if (
      !userDefaultsSelector.isLoading() &&
      !isDefined(detailsExportFileName) &&
      !isDefined(userDefaultsSelector.getError())
    ) {
      loadSettings();
    }
  }, [dispatch, gmp, userDefaultsSelector]);

  const handleEntityDownload = async (
    entity: TEntity,
    options?: TDataOptions & GenerateFilenameParams,
  ) => {
    const detailsExportFileName = userDefaultsSelector.getValueByName(
      'detailsexportfilename',
    );

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
          _('{{name}} downloaded successfully.', {name: entity.name as string}),
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
