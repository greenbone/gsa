/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import EntityComponent from 'web/entity/Component';
import {
  loadAllEntities as loadAllGroups,
  selector as groupSelector,
} from 'web/store/entities/groups';
import {
  loadAllEntities as loadAllUsers,
  selector as userSelector,
} from 'web/store/entities/users';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import RoleDialog from './Dialog';

class RoleComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
      error: undefined,
    };

    this.handleCreatePermission = this.handleCreatePermission.bind(this);
    this.handleCreateSuperPermission =
      this.handleCreateSuperPermission.bind(this);
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
        onCloneError={onCloneError}
        onCloned={onCloned}
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
              create: this.openRoleDialog,
              edit: this.openRoleDialog,
            })}
            {dialogVisible && (
              <RoleDialog
                allGroups={allGroups}
                allPermissions={allPermissions}
                allUsers={allUsers}
                error={error}
                isCreatingPermission={isCreatingPermission}
                isCreatingSuperPermission={isCreatingSuperPermission}
                isInUse={isInUse}
                isLoadingPermissions={isLoadingPermissions}
                permissions={permissions}
                role={role}
                title={title}
                onClose={this.handleCloseRoleDialog}
                onCreatePermission={this.handleCreatePermission}
                onCreateSuperPermission={this.handleCreateSuperPermission}
                onDeletePermission={this.handleDeletePermission}
                onErrorClose={this.handleErrorClose}
                onSave={d => {
                  this.handleInteraction();
                  return save(d)
                    .then(() => this.closeRoleDialog())
                    .catch(e => this.setError(e));
                }}
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
