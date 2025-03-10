/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useDispatch} from 'react-redux';
import actionFunction from 'web/entity/hooks/actionFunction';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {createDeleteEntity} from 'web/store/entities/utils/actions';
import PropTypes from 'web/utils/PropTypes';

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
  const [_] = useTranslation();
  const dispatch = useDispatch();
  const cmd = gmp[name];
  const deleteEntity = entity =>
    dispatch(createDeleteEntity({entityType: name})(gmp)(entity.id));

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntityDownload = useEntityDownload(name, {
    onDownloadError,
    onDownloaded,
    onInteraction: handleInteraction,
  });

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
