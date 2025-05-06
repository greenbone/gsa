/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {useState} from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import HostDialog from 'web/pages/hosts/Dialog';
import TargetComponent from 'web/pages/targets/Component';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

const HostComponent = ({
  children,
  createtarget,
  entitiesCounts,
  onIdentifierDeleted,
  onIdentifierDeleteError,
  onCreateError,
  onCreated,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onInteraction,
  onSaveError,
  onSaved,
  ...props
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [host, setHost] = useState();
  const [title, setTitle] = useState();

  const handleIdentifierDelete = identifier => {
    handleInteraction();

    return gmp.host
      .deleteIdentifier(identifier)
      .then(onIdentifierDeleted, onIdentifierDeleteError);
  };

  const openHostDialog = host => {
    let dialogTitle;

    if (isDefined(host)) {
      dialogTitle = _('Edit Host {{name}}', {name: shorten(host.name)});
    }

    setDialogVisible(true);
    setHost(host);
    setTitle(dialogTitle);

    handleInteraction();
  };

  const closeHostDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseHostDialog = () => {
    closeHostDialog();
    handleInteraction();
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const openCreateTargetDialog = host => {
    _openTargetDialog(1, 'uuid=' + host.id);
  };

  const openCreateTargetSelectionDialog = data => {
    const {entities, entitiesSelected, selectionType, filter} = data;
    let size;
    let filterString;

    if (selectionType === SelectionType.SELECTION_USER) {
      const hosts = [...entitiesSelected]; // convert set to array
      size = entitiesSelected.size;
      filterString = map(hosts, host => 'uuid=' + host.id).join(' ');
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      size = entities.length;
      filterString = filter.toFilterString();
    } else {
      const counts = entitiesCounts;
      size = counts.filtered;
      filterString = filter.all().toFilterString();
    }
    _openTargetDialog(size, filterString);
  };

  const _openTargetDialog = (count, filterString) => {
    createtarget({
      target_source: 'asset_hosts',
      hosts_count: count,
      hosts_filter: filterString,
    });
  };

  return (
    <EntityComponent
      name="host"
      onCreateError={onCreateError}
      onCreated={onCreated}
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaveError={onSaveError}
      onSaved={onSaved}
    >
      {({save, ...other}) => (
        <>
          {children({
            ...other,
            create: openHostDialog,
            edit: openHostDialog,
            deleteidentifier: handleIdentifierDelete,
            createtargetfromselection: openCreateTargetSelectionDialog,
            createtargetfromhost: openCreateTargetDialog,
          })}
          {dialogVisible && (
            <HostDialog
              host={host}
              title={title}
              onClose={handleCloseHostDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeHostDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

HostComponent.propTypes = {
  children: PropTypes.func.isRequired,
  createtarget: PropTypes.func.isRequired,
  entitiesCounts: PropTypes.counts,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onIdentifierDeleteError: PropTypes.func,
  onIdentifierDeleted: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

const HostComponentWrapper = HostComponent;

const HostWithTargetComponent = ({
  onInteraction,
  onTargetCreated,
  onTargetCreateError,
  ...props
}) => {
  return (
    <TargetComponent
      onCreateError={onTargetCreateError}
      onCreated={onTargetCreated}
      onInteraction={onInteraction}
    >
      {({create}) => (
        <HostComponentWrapper
          {...props}
          createtarget={create}
          onInteraction={onInteraction}
        />
      )}
    </TargetComponent>
  );
};

HostWithTargetComponent.propTypes = {
  onInteraction: PropTypes.func.isRequired,
  onTargetCreateError: PropTypes.func.isRequired,
  onTargetCreated: PropTypes.func.isRequired,
};

export default HostWithTargetComponent;
