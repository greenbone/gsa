/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import {
  loadAllEntities as loadAllGroups,
  selector as groupSelector,
} from 'web/store/entities/groups';

import {
  loadAllEntities as loadAllUsers,
  selector as userSelector,
} from 'web/store/entities/users';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import RoleDialog from './dialog';

class RoleComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
      error: undefined,
    };

    this.handleCreatePermission = this.handleCreatePermission.bind(this);
    this.handleCreateSuperPermission = this.handleCreateSuperPermission.bind(
      this,
    );
    this.handleDeletePermission = this.handleDeletePermission.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);

    this.handleCloseRoleDialog = this.handleCloseRoleDialog.bind(this);
    this.openRoleDialog = this.openRoleDialog.bind(this);
  }

  openRoleDialog(role) {
    this.handleInteraction();

    this.props.loadAllUsers();

    if (isDefined(role)) {
      this.loadSettings(role.id);

      this.setState({
        dialogVisible: true,
        isInUse: role.isInUse(),
        role,
        title: _('Edit Role {{name}}', role),
      });
    } else {
      this.setState({
        allPermissions: undefined,
        dialogVisible: true,
        permissions: undefined,
        role: undefined,
        isInUse: false,
        title: _('New Role'),
      });
    }
  }

  closeRoleDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseRoleDialog() {
    this.closeRoleDialog();
    this.handleInteraction();
  }

  handleCreateSuperPermission({roleId, groupId}) {
    const {gmp} = this.props;

    this.handleInteraction();

    this.setState({isCreatingSuperPermission: true});

    return gmp.permission
      .create({
        name: 'Super',
        resourceType: 'group',
        resourceId: groupId,
        roleId,
        subjectType: 'role',
      })
      .then(
        () => this.loadSettings(roleId),
        error => this.setError(error),
      )
      .then(() => this.setState({isCreatingSuperPermission: false}));
  }

  handleCreatePermission({roleId, name}) {
    const {gmp} = this.props;

    this.handleInteraction();

    this.setState({isCreatingPermission: true});

    return gmp.permission
      .create({
        name,
        roleId,
        subjectType: 'role',
      })
      .then(
        () => this.loadSettings(roleId),
        error => this.setError(error),
      )
      .then(() => this.setState({isCreatingPermission: false}));
  }

  handleDeletePermission({roleId, permissionId}) {
    const {gmp} = this.props;

    this.handleInteraction();

    return gmp.permission.delete({id: permissionId}).then(
      () => this.loadSettings(roleId),
      error => this.setError(error),
    );
  }

  handleErrorClose() {
    this.setState({error: undefined});
  }

  setError(error) {
    this.setState({error: error.message});
  }

  loadSettings(roleId) {
    const {gmp, capabilities} = this.props;

    if (capabilities.mayAccess('groups')) {
      this.props.loadAllGroups(); // groups are only used in edit dialog
    }

    if (capabilities.mayAccess('permissions')) {
      this.setState({isLoadingPermissions: true});
      gmp.permissions
        .getAll({
          filter: Filter.fromString(
            `subject_type=role and subject_uuid=${roleId}`,
          ),
        })
        .then(response => {
          const allPermissions = [];
          const {data: permissions = []} = response;

          const perm_names = new Set(
            permissions
              .filter(perm => !isDefined(perm.resource))
              .map(perm => perm.name),
          );

          for (const cap of capabilities) {
            if (cap !== 'get_version' && !perm_names.has(cap)) {
              allPermissions.push(cap);
            }
          }
          this.setState({permissions, allPermissions});
        })
        .catch(error => this.setError(error))
        .then(() => this.setState({isLoadingPermissions: false}));
    }
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  render() {
    const {
      allGroups,
      allUsers,
      children,
      onCloned,
      onCloneError,
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

    const {
      allPermissions,
      dialogVisible,
      error,
      isCreatingPermission,
      isCreatingSuperPermission,
      isInUse,
      isLoadingPermissions,
      permissions,
      role,
      title,
    } = this.state;

    return (
      <EntityComponent
        name="role"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({save, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              create: this.openRoleDialog,
              edit: this.openRoleDialog,
            })}
            {dialogVisible && (
              <RoleDialog
                allUsers={allUsers}
                allGroups={allGroups}
                allPermissions={allPermissions}
                error={error}
                isCreatingPermission={isCreatingPermission}
                isCreatingSuperPermission={isCreatingSuperPermission}
                isInUse={isInUse}
                isLoadingPermissions={isLoadingPermissions}
                permissions={permissions}
                role={role}
                title={title}
                onClose={this.handleCloseRoleDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d)
                    .then(() => this.closeRoleDialog())
                    .catch(e => this.setError(e));
                }}
                onCreatePermission={this.handleCreatePermission}
                onCreateSuperPermission={this.handleCreateSuperPermission}
                onDeletePermission={this.handleDeletePermission}
                onErrorClose={this.handleErrorClose}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

RoleComponent.propTypes = {
  allGroups: PropTypes.arrayOf(PropTypes.model),
  allUsers: PropTypes.arrayOf(PropTypes.model),
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  loadAllGroups: PropTypes.func.isRequired,
  loadAllUsers: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

const mapStateToProps = rootState => {
  const usersSel = userSelector(rootState);
  const groupsSel = groupSelector(rootState);
  return {
    allUsers: usersSel.getAllEntities(),
    allGroups: groupsSel.getAllEntities(),
  };
};

const mapDispatchToProp = (dispatch, {gmp}) => ({
  loadAllGroups: () => dispatch(loadAllGroups(gmp)()),
  loadAllUsers: () => dispatch(loadAllUsers(gmp)()),
});

export default compose(
  withGmp,
  withCapabilities,
  connect(mapStateToProps, mapDispatchToProp),
)(RoleComponent);

// vim: set ts=2 sw=2 tw=80:
