/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {is_defined, map} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import SelectionType from '../../utils/selectiontype.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import TargetComponent from '../targets/component.js';

import HostDialog from './dialog.js';

class HostComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleIdentifierDelete = this.handleIdentifierDelete.bind(this);
    this.openHostDialog = this.openHostDialog.bind(this);
    this.openCreateTargetDialog = this.openCreateTargetDialog.bind(this);
    this.openCreateTargetSelectionDialog =
      this.openCreateTargetSelectionDialog.bind(this);
  }

  handleIdentifierDelete(identifier) {
    const {onIdentifierDeleted, onIdentifierDeleteError} = this.props;
    const {gmp} = this.context;
    return gmp.host.deleteIdentifier(identifier).then(
      onIdentifierDeleted, onIdentifierDeleteError);
  }

  openHostDialog(host) {
    this.hosts_dialog.show({
      host,
      id: is_defined(host) ? host.id : undefined,
      name: is_defined(host) ? host.name : '127.0.0.1',
      comment: is_defined(host) ? host.comment : '',
    });
  }

  openCreateTargetDialog(host) {
    this._openTargetDialog(1, 'uuid=' + host.id);
  }

  openCreateTargetSelectionDialog(data) {
    const {entities, entitiesSelected, selectionType, filter} = data;

    let size;
    let filterstring;

    if (selectionType === SelectionType.SELECTION_USER) {
      const hosts = [...entitiesSelected]; // convert set to array
      size = entitiesSelected.size;
      filterstring = map(hosts, host => 'uuid=' + host.id).join(' ');

    }
    else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      size = entities.length;
      filterstring = filter.toFilterString();
    }
    else {
      const counts = entities.getCounts();
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
      onCloned,
      onCloneError,
      onCreated,
      onCreateError,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onSaved,
      onSaveError,
    } = this.props;
    return (
      <EntityComponent
        name="host"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Wrapper>
            {children({
              ...other,
              create: this.openHostDialog,
              edit: this.openHostDialog,
              deleteidentifier: this.handleIdentifierDelete,
              createtargetfromselection: this.openCreateTargetSelectionDialog,
              createtargetfromhost: this.openCreateTargetDialog,
            })}
            <HostDialog
              ref={ref => this.hosts_dialog = ref}
              onSave={save}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

HostComponent.propTypes = {
  children: PropTypes.func.isRequired,
  createtarget: PropTypes.func.isRequired,
  selectionType: PropTypes.string,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onIdentifierDeleteError: PropTypes.func,
  onIdentifierDeleted: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

HostComponent.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const HostWithTargetComponent = ({
  onTargetCreated,
  onTargetCreateError,
  ...props
}) => {
  return (
    <TargetComponent
      onCreated={onTargetCreated}
      onCreateError={onTargetCreateError}
    >
      {({create}) => (
        <HostComponent
          {...props}
          createtarget={create}
        />
      )}
    </TargetComponent>
  );
};

HostWithTargetComponent.propTypes = {
  onTargetCreateError: PropTypes.func.isRequired,
  onTargetCreated: PropTypes.func.isRequired,
};

export default HostWithTargetComponent;

// vim: set ts=2 sw=2 tw=80:
