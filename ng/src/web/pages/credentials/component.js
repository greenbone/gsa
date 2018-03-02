/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {is_defined, shorten} from 'gmp/utils';

import {
  ALL_CREDENTIAL_TYPES,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import CredentialsDialog from './dialog.js';

class CredentialsComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.closeCredentialDialog = this.closeCredentialDialog.bind(this);
    this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
    this.handleDownloadInstaller = this.handleDownloadInstaller.bind(this);
  }

  openCredentialsDialog(credential) {
    if (credential) {
      const title = _('Edit Credential {{name}}',
        {name: shorten(credential.name)});
      this.setState({
        base: credential.credential_type,
        credential,
        credential_login: credential.login,
        privacy_algorithm: is_defined(credential.privacy) ?
          credential.privacy.algorithm : undefined,
        types: [credential.credential_type],
        dialogVisible: true,
        title,
      });
    }
    else {
      this.setState({
        base: USERNAME_PASSWORD_CREDENTIAL_TYPE,
        credential: undefined,
        types: ALL_CREDENTIAL_TYPES,
        dialogVisible: true,
      });
    }
  }

  closeCredentialDialog() {
    this.setState({dialogVisible: false});
  }

  handleDownloadInstaller(credential, format) {
    const {
      gmp,
      onInstallerDownloaded,
      onInstallerDownloadError,
    } = this.props;

    return gmp.credential.download(credential, format)
      .then(response => {
        const {id, name} = credential;
        const filename = 'credential-' + name + '-' + id + '.' + format;
        return {filename, data: response.data};
      })
      .then(onInstallerDownloaded, onInstallerDownloadError);
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
      credential,
      dialogVisible,
      title,
      types,
    } = this.state;

    return (
      <EntityComponent
        name="credential"
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
              create: this.openCredentialsDialog,
              edit: this.openCredentialsDialog,
              downloadinstaller: this.handleDownloadInstaller,
            })}
            <CredentialsDialog
              credential={credential}
              title={title}
              types={types}
              visible={dialogVisible}
              onClose={this.closeCredentialDialog}
              onSave={save}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

CredentialsComponent.propTypes = {
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
  onInstallerDownloadError: PropTypes.func,
  onInstallerDownloaded: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default withGmp(CredentialsComponent);

// vim: set ts=2 sw=2 tw=80:
