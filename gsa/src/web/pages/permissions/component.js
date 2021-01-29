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

import _ from 'gmp/locale';

import {getEntityType} from 'gmp/utils/entitytype';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import EntityComponent from 'web/entity/component';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';
import withCapabilities from 'web/utils/withCapabilities';

import PermissionDialog from './dialog';

class PermissionsComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleClosePermissionDialog = this.handleClosePermissionDialog.bind(
      this,
    );
    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission, fixed = false) {
    const {gmp, capabilities} = this.props;

    let state;
    let opts;

    if (isDefined(permission)) {
      const subjectType = isDefined(permission.subject)
        ? getEntityType(permission.subject)
        : undefined;

      state = {
        id: permission.id,
        name: permission.name,
        comment: permission.comment,
        groupId: undefined,
        permission,
        resourceId: isDefined(permission.resource)
          ? permission.resource.id
          : '',
        resourceName: isDefined(permission.resource)
          ? permission.resource.name
          : '',
        resourceType: isDefined(permission.resource)
          ? getEntityType(permission.resource)
          : '',
        roleId: undefined,
        subjectType,
        title: _('Edit Permission {{name}}', {name: permission.name}),
        userId: undefined,
      };

      switch (subjectType) {
        case 'user':
          state.userId = permission.subject.id;
          break;
        case 'role':
          state.roleId = permission.subject.id;
          break;
        case 'group':
          state.groupId = permission.subject.id;
          break;
        default:
          break;
      }
      opts = {
        title: _('Edit permission {{name}}', {name: shorten(permission.name)}),
      };
    } else {
      state = {
        comment: undefined,
        id: undefined,
        name: undefined,
        resourceId: undefined,
        resourceName: undefined,
        resourceType: undefined,
        subjectType: undefined,
        userId: undefined,
        groupId: undefined,
        roleId: undefined,
        title: undefined,
      };
    }

    state.fixedResource = fixed;

    if (capabilities.mayAccess('users')) {
      if (!isDefined(state.subjectType)) {
        state.subjectType = 'user';
      }

      gmp.users.getAll().then(response => {
        const {data: users} = response;
        this.setState({
          userId: selectSaveId(users, state.userId),
          users,
        });
      });
    }

    if (capabilities.mayAccess('roles')) {
      if (!capabilities.mayAccess('users') && !isDefined(state.subjectType)) {
        state.subjectType = 'role';
      }

      gmp.roles.getAll().then(response => {
        const {data: roles} = response;
        this.setState({
          roleId: selectSaveId(roles, state.roleId),
          roles,
        });
      });
    }

    if (capabilities.mayAccess('groups')) {
      if (
        !capabilities.mayAccess('users') &&
        !capabilities.mayAccess('roles') &&
        !isDefined(state.subjectType)
      ) {
        state.subjectType = 'group';
      }

      gmp.groups.getAll().then(response => {
        const {data: groups} = response;
        this.setState({
          groupId: selectSaveId(groups, state.groupId),
          groups,
        });
      });
    }

    this.setState({
      ...state,
      dialogVisible: true,
      ...opts,
    });

    this.handleInteraction();
  }

  closePermissionDialog() {
    this.setState({dialogVisible: false});
  }

  handleClosePermissionDialog() {
    this.closePermissionDialog();
    this.handleInteraction();
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
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
      onInteraction,
      onSaved,
      onSaveError,
    } = this.props;

    const {
      dialogVisible,
      comment,
      fixedResource,
      id,
      groupId,
      groups,
      name,
      permission,
      resourceId,
      resourceName,
      resourceType,
      roleId,
      roles,
      subjectType,
      title,
      userId,
      users,
    } = this.state;

    return (
      <EntityComponent
        name="permission"
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
              create: this.openPermissionDialog,
              edit: this.openPermissionDialog,
            })}
            {dialogVisible && (
              <PermissionDialog
                comment={comment}
                fixedResource={fixedResource}
                groupId={groupId}
                groups={groups}
                id={id}
                name={name}
                permission={permission}
                resourceId={resourceId}
                resourceName={resourceName}
                resourceType={resourceType}
                roleId={roleId}
                roles={roles}
                subjectType={subjectType}
                title={title}
                userId={userId}
                users={users}
                onClose={this.handleClosePermissionDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closePermissionDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

PermissionsComponent.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
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

export default compose(withGmp, withCapabilities)(PermissionsComponent);

// vim: set ts=2 sw=2 tw=80:
