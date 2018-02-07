/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import EntityComponent from '../../entity/component.js';

import Wrapper from '../../components/layout/wrapper.js';

import UserDialog from './dialog.js';

class UserComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.openUserDialog = this.openUserDialog.bind(this);
  }

  openUserDialog(user) {
    const {gmp} = this.context;

    gmp.user.currentAuthSettings().then(response => {
      if (is_defined(user)) {
        const group_ids = user.groups.map(group => group.id);
        const role_ids = user.roles.map(role => role.id);

        this.user_dialog.show({
          id: user.id,
          name: user.name,
          old_name: user.name,
          auth_method: user.auth_method,
          access_hosts: user.hosts.addresses,
          access_ifaces: user.ifaces.addresses,
          comment: user.comment,
          group_ids: group_ids,
          hosts_allow: user.hosts.allow,
          ifaces_allow: user.ifaces.allow,
          role_ids: role_ids,
          settings: response.data,
        }, {
          title: _('Edit User {{name}}', user),
        });
      }
      else {
        this.user_dialog.show({settings: response.data});
      }

      gmp.groups.getAll({
        filter: 'permission=modify_group', //  list only groups current user may modify
      }).then(resp =>
        this.user_dialog.setValue('groups', resp.data));
      gmp.roles.getAll()
        .then(resp => this.user_dialog.setValue('roles', resp.data));
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
        name="user"
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
              create: this.openUserDialog,
              edit: this.openUserDialog,
            })}
            <UserDialog
              ref={ref => this.user_dialog = ref}
              onSave={save}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

UserComponent.propTypes = {
  children: PropTypes.func.isRequired,
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

UserComponent.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default UserComponent;

// vim: set ts=2 sw=2 tw=80:
