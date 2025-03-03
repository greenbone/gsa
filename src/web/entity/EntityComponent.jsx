/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useDispatch} from 'react-redux';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import {createDeleteEntity} from 'web/store/entities/utils/actions';
import PropTypes from 'web/utils/PropTypes';

/**
 * Executes a promise and handles success and error callbacks.
 *
 * @param {Promise} promise - The promise to be executed.
 * @param {Function} [onSuccess] - Optional callback function to be called on successful resolution of the promise.
 * @param {Function} [onError] - Optional callback function to be called if the promise is rejected.
 * @returns {Promise<*>} - The result of the onSuccess callback if provided, otherwise the resolved value of the promise.
 *                         If the promise is rejected the result of the onError callback if provided.
 *                         Otherwise the error from the rejected promise is thrown.
 * @throws {*} - The error from the rejected promise if onError callback is not provided.
 */
const actionFunction = async (promise, onSuccess, onError) => {
  try {
    const response = await promise;
    if (isDefined(onSuccess)) {
      return onSuccess(response);
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
  const dispatch = useDispatch();
  const cmd = gmp[name];
  const deleteEntity = entity =>
    dispatch(createDeleteEntity({entityType: name})(gmp)(entity.id));

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
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

    return actionFunction(deleteEntity(entity), onDeleted, onDeleteError);
  };

  const handleEntityClone = async entity => {
    handleInteraction();

    return actionFunction(cmd.clone(entity), onCloned, onCloneError);
  };

  const handleEntityDownload = useEntityDownload(name, {
    onDownloadError,
    onDownloaded,
    onInteraction,
  });

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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default EntityComponent;
