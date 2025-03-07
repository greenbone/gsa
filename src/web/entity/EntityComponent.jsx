/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import {createDeleteEntity} from 'web/store/entities/utils/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';

/**
 * Executes a promise and handles success and error callbacks.
 *
 * @param {Promise} promise - The promise to be executed.
 * @param {Function} [onSuccess] - Optional callback function to be called on successful resolution of the promise.
 * @param {Function} [onError] - Optional callback function to be called if the promise is rejected.
 * @param {string} [successMessage] - Optional message to display if the action is successful.
 * @returns {Promise<*>} - The result of the onSuccess callback if provided, otherwise the resolved value of the promise.
 *                         If the promise is rejected the result of the onError callback if provided.
 *                         Otherwise the error from the rejected promise is thrown.
 * @throws {*} - The error from the rejected promise if onError callback is not provided.
 */
const actionFunction = async (promise, onSuccess, onError, successMessage) => {
  try {
    const response = await promise;
    if (isDefined(onSuccess)) {
      onSuccess(response);
      showSuccessNotification('', successMessage);
    }
  } catch (error) {
    if (isDefined(onError)) {
      return onError(error);
    }
    throw error;
  }
};

const EntityComponent = ({
  children,
  name,
  onInteraction,
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
}) => {
  const gmp = useGmp();
  const username = useSelector(getUsername);
  const [_] = useTranslation();
  const dispatch = useDispatch();
  const cmd = gmp[name];
  const deleteEntity = entity =>
    dispatch(createDeleteEntity({entityType: name})(gmp)(entity.id));
  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntityDownload = async entity => {
    handleInteraction();

    const filename = generateFilename({
      creationTime: entity.creationTime,
      fileNameFormat: detailsExportFileName,
      id: entity.id,
      modificationTime: entity.modificationTime,
      resourceName: entity.name,
      resourceType: name,
      username,
    });

    try {
      const response = await cmd.export(entity);

      if (isDefined(onDownloaded)) {
        onDownloaded({filename, data: response.data});
        showSuccessNotification(
          '',
          _('{{name}} downloaded successfully.', {name: entity.name}),
        );
      }
    } catch (error) {
      if (isDefined(onDownloadError)) {
        return onDownloadError(error);
      }
    }
  };

  const handleEntitySave = async data => {
    handleInteraction();

    if (isDefined(data.id)) {
      return actionFunction(cmd.save(data), onSaved, onSaveError);
    }

    return actionFunction(cmd.create(data), onCreated, onCreateError);
  };

  const handleEntityDelete = async entity => {
    handleInteraction();

    return actionFunction(
      deleteEntity(entity),
      onDeleted,
      onDeleteError,
      _('{{name}} deleted successfully.', {name: entity.name}),
    );
  };

  const handleEntityClone = async entity => {
    handleInteraction();

    return actionFunction(
      cmd.clone(entity),
      onCloned,
      onCloneError,
      _('{{name}} cloned successfully.', {name: entity.name}),
    );
  };

  useEffect(() => {
    const loadSettings = () => dispatch(loadUserSettingDefaults(gmp)());
    if (
      !userDefaultsSelector.isLoading() &&
      !isDefined(detailsExportFileName) &&
      !isDefined(userDefaultsSelector.getError())
    ) {
      loadSettings();
    }
  }, [detailsExportFileName, dispatch, gmp, userDefaultsSelector]);

  return children({
    create: handleEntitySave,
    clone: handleEntityClone,
    delete: handleEntityDelete,
    save: handleEntitySave,
    download: handleEntityDownload,
  });
};

EntityComponent.propTypes = {
  children: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onCloned: PropTypes.func,
  onCloneError: PropTypes.func,
  onCreated: PropTypes.func,
  onCreateError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onDownloadError: PropTypes.func,
  onInteraction: PropTypes.func,
};

export default EntityComponent;
