/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityCreate from 'web/entity/hooks/useEntityCreate';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
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
  const handleEntityDownload = useEntityDownload(name, {
    onDownloadError,
    onDownloaded,
    onInteraction,
  });

  const handleEntitySave = useEntitySave(name, {
    onSaveError,
    onSaved,
    onInteraction,
  });

  const handleEntityCreate = useEntityCreate(name, {
    onCreated,
    onCreateError,
    onInteraction,
  });

  const handleEntityDelete = useEntityDelete(name, {
    onDeleteError,
    onDeleted,
    onInteraction,
  });

  const handleEntityClone = useEntityClone(name, {
    onCloneError,
    onCloned,
    onInteraction,
  });

  return children({
    create: handleEntityCreate,
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
