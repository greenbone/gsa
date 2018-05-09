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
    if (is_defined(credential)) {
      const title = _('Edit Credential {{name}}',
        {name: shorten(credential.name)});

      this.setState({
        allow_insecure: credential.allow_insecure,
        comment: credential.comment,
        credential,
        base: credential.credential_type,
        auth_algorithm: credential.auth_algorithm,
        name: credential.name,
        credential_login: credential.login,
        privacy_algorithm: is_defined(credential.privacy) ?
          credential.privacy.algorithm : undefined,
        types: [credential.credential_type],
        dialogVisible: true,
        title,
      });
    }
    else {
      // reset all values in state to not show values from last edit
      this.setState({
        allow_insecure: undefined,
        comment: undefined,
        credential: undefined,
        base: undefined,
        auth_algorithm: undefined,
        name: undefined,
        credential_login: undefined,
        privacy_algorithm: undefined,
        types: ALL_CREDENTIAL_TYPES,
        dialogVisible: true,
        title: _('New Credential'),
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
      dialogVisible,
      ...dialogProps
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

            {dialogVisible &&
              <CredentialsDialog
                {...dialogProps}
                visible={dialogVisible}
                onClose={this.closeCredentialDialog}
                onSave={save}
              />
            }
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
