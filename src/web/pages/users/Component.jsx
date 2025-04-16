/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import EntityComponent from 'web/entity/EntityComponent';
import UserDialog from 'web/pages/users/Dialog';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

class UserComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      dialogVisible: false,
    };

    this.handleCloseUserDialog = this.handleCloseUserDialog.bind(this);
    this.openUserDialog = this.openUserDialog.bind(this);
  }

  openUserDialog(user) {
    const {gmp} = this.props;
    const {_} = this.props;

    this.handleInteraction();

    gmp.groups
      .getAll({
        filter: 'permission=modify_group', //  list only groups current user may modify
      })
      .then(resp => this.setState({groups: resp.data}));

    gmp.roles.getAll().then(resp => this.setState({roles: resp.data}));

    gmp.user.currentAuthSettings().then(response => {
      if (isDefined(user)) {
        const groupIds = user.groups.map(group => group.id);
        const roleIds = user.roles.map(role => role.id);

        this.setState({
          dialogVisible: true,
          accessHosts: user.hosts.addresses.join(', '),
          comment: user.comment,
          groupIds,
          hostsAllow: user.hosts.allow,
          name: user.name,
          oldName: user.name,
          roleIds,
          settings: response.data,
          title: _('Edit User {{name}}', user),
          user,
        });
      } else {
        this.setState({
          accessHosts: undefined,
          comment: undefined,
          dialogVisible: true,
          groupIds: undefined,
          hostsAllow: undefined,
          name: undefined,
          oldName: undefined,
          roleIds: undefined,
          settings: response.data,
          title: undefined,
          user: undefined,
        });
      }
    });
  }

  closeUserDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseUserDialog() {
    this.closeUserDialog();
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
      accessHosts,
      comment,
      dialogVisible,
      groupIds,
      groups,
      hostsAllow,
      name,
      oldName,
      roleIds,
      roles,
      settings,
      title,
      user,
    } = this.state;

    return (
      <EntityComponent
        name="user"
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
              create: this.openUserDialog,
              edit: this.openUserDialog,
            })}
            {dialogVisible && (
              <UserDialog
                accessHosts={accessHosts}
                comment={comment}
                groupIds={groupIds}
                groups={groups}
                hostsAllow={hostsAllow}
                name={name}
                oldName={oldName}
                roleIds={roleIds}
                roles={roles}
                settings={settings}
                title={title}
                user={user}
                onClose={this.handleCloseUserDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeUserDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

UserComponent.propTypes = {
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
  _: PropTypes.func.isRequired,
};

export default withGmp(withTranslation(UserComponent));
