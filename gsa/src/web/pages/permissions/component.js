/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.aterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, shorten, select_save_id} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import compose from '../../utils/compose.js';
import withGmp from '../../utils/withGmp.js';
import withCapabilities from '../../utils/withCapabilities.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import PermissionDialog from './dialog.js';
import {getEntityType} from 'gmp/utils/entitytype.js';

class PermissionsComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closePermissionDialog = this.closePermissionDialog.bind(this);
    this.openPermissionDialog = this.openPermissionDialog.bind(this);
  }

  openPermissionDialog(permission, fixed = false) {
    const {gmp, capabilities} = this.props;

    let state;
    let opts;

    if (is_defined(permission)) {
      const subjectType = is_defined(permission.subject) ?
        getEntityType(permission.subject) : undefined;

      state = {
        id: permission.id,
        name: permission.name,
        comment: permission.comment,
        groupId: undefined,
        permission,
        resourceId: is_defined(permission.resource) ?
          permission.resource.id : '',
        resourceType: is_defined(permission.resource) ?
          getEntityType(permission.resource) : '',
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
    }
    else {
      state = {
        comment: undefined,
        id: undefined,
        name: undefined,
        resourceType: undefined,
        resourceId: undefined,
        subjectType: undefined,
        userId: undefined,
        groupId: undefined,
        roleId: undefined,
        title: undefined,
      };
    }

    state.fixedResource = fixed;

    if (capabilities.mayAccess('users')) {
      if (!is_defined(state.subjectType)) {
        state.subjectType = 'user';
      }

      gmp.users.getAll().then(response => {
        const {data: users} = response;
        this.setState({
          userId: select_save_id(users, state.userId),
          users,
        });
      });
    }

    if (capabilities.mayAccess('roles')) {
      if (!capabilities.mayAccess('users') &&
        !is_defined(state.subjectType)) {
        state.subjectType = 'role';
      }

      gmp.roles.getAll().then(response => {
        const {data: roles} = response;
        this.setState({
          roleId: select_save_id(roles, state.roleId),
          roles,
        });
      });
    }

    if (capabilities.mayAccess('groups')) {
      if (!capabilities.mayAccess('users') &&
        !capabilities.mayAccess('roles') && !is_defined(state.subjectType)) {
        state.subjectType = 'group';
      }

      gmp.groups.getAll().then(response => {
        const {data: groups} = response;
        this.setState({
          groupId: select_save_id(groups, state.groupId),
          groups,
        });
      });
    }

    this.setState({
      ...state,
      dialogVisible: true,
      ...opts,
    });
  }

  closePermissionDialog() {
    this.setState({dialogVisible: false});
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
              create: this.openPermissionDialog,
              edit: this.openPermissionDialog,
            })}
            {dialogVisible &&
              <PermissionDialog
                comment={comment}
                fixedResource={fixedResource}
                groupId={groupId}
                groups={groups}
                id={id}
                name={name}
                permission={permission}
                resourceId={resourceId}
                resourceIype={resourceType}
                roleId={roleId}
                roles={roles}
                subjectType={subjectType}
                title={title}
                userId={userId}
                users={users}
                onClose={this.closePermissionDialog}
                onSave={save}
              />
            }
          </Wrapper>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default compose(
  withGmp,
  withCapabilities,
)(PermissionsComponent);

// vim: set ts=2 sw=2 tw=80:
