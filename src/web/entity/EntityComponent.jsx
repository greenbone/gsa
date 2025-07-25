/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useEntityClone from 'web/entity/hooks/useEntityClone';
import useEntityDelete from 'web/entity/hooks/useEntityDelete';
import useEntityDownload from 'web/entity/hooks/useEntityDownload';
import useEntitySave from 'web/entity/hooks/useEntitySave';
import PropTypes from 'web/utils/PropTypes';

const EntityComponent = ({
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
}) => {
  const handleEntityDownload = useEntityDownload(name, {
    onDownloadError,
    onDownloaded,
  });

  const handleEntitySave = useEntitySave(name, {
    onSaveError,
    onSaved,
    onCreated,
    onCreateError,
  });

  const handleEntityDelete = useEntityDelete(name, {
    onDeleteError,
    onDeleted,
  });

  const handleEntityClone = useEntityClone(name, {
    onCloneError,
    onCloned,
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default EntityComponent;
