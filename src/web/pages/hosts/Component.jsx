/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import EntityComponent from 'web/entity/Component';
import HostDialog from 'web/pages/hosts/Dialog';
import TargetComponent from 'web/pages/targets/Component';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';
import withGmp from 'web/utils/withGmp';

class HostComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseHostDialog = this.handleCloseHostDialog.bind(this);
    this.handleIdentifierDelete = this.handleIdentifierDelete.bind(this);
    this.openHostDialog = this.openHostDialog.bind(this);
    this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
    this.openCreateTargetSelectionDialog =
      this.openCreateTargetSelectionDialog.bind(this);
  }

  handleIdentifierDelete(identifier) {
    const {gmp, onIdentifierDeleted, onIdentifierDeleteError} = this.props;

    this.handleInteraction();

    return gmp.host
      .deleteIdentifier(identifier)
      .then(onIdentifierDeleted, onIdentifierDeleteError);
  }

  openHostDialog(host) {
    let title;

    if (isDefined(host)) {
      title = _('Edit Host {{name}}', {name: shorten(host.name)});
    }

    this.setState({
      dialogVisible: true,
      host,
      title,
    });

    this.handleInteraction();
  }

  closeHostDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseHostDialog() {
    this.closeHostDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  openCreateTargetDialog(host) {
    this._openTargetDialog(1, 'uuid=' + host.id);
  }

  openCreateTargetSelectionDialog(data) {
    const {entities, entitiesSelected, selectionType, filter} = data;
    const {entitiesCounts} = this.props;
    let size;
    let filterstring;

    if (selectionType === SelectionType.SELECTION_USER) {
      const hosts = [...entitiesSelected]; // convert set to array
      size = entitiesSelected.size;
      filterstring = map(hosts, host => 'uuid=' + host.id).join(' ');
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      size = entities.length;
      filterstring = filter.toFilterString();
    } else {
      const counts = entitiesCounts;
      size = counts.filtered;
      filterstring = filter.all().toFilterString();
    }
    this._openTargetDialog(size, filterstring);
  }

  _openTargetDialog(count, filterstring) {
    const {createtarget} = this.props;
    createtarget({
      target_source: 'asset_hosts',
      hosts_count: count,
      hosts_filter: filterstring,
    });
  }

  render() {
    const {
      children,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {dialogVisible, host, title} = this.state;

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
          <React.Fragment>
            {children({
              ...other,
              create: this.openHostDialog,
              edit: this.openHostDialog,
              deleteidentifier: this.handleIdentifierDelete,
              createtargetfromselection: this.openCreateTargetSelectionDialog,
              createtargetfromhost: this.openCreateTargetDialog,
            })}
            {dialogVisible && (
              <HostDialog
                host={host}
                title={title}
                onClose={this.handleCloseHostDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeHostDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

HostComponent.propTypes = {
  children: PropTypes.func.isRequired,
  createtarget: PropTypes.func.isRequired,
  entitiesCounts: PropTypes.counts,
  gmp: PropTypes.gmp.isRequired,
  selectionType: PropTypes.string,
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

HostComponent = withGmp(HostComponent);

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
        <HostComponent
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
