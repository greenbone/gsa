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

import _ from 'gmp/locale.js';
import {is_defined, shorten, select_save_id} from 'gmp/utils.js';

import {
  SLAVE_SCANNER_TYPE,
} from 'gmp/models/scanner.js';

import {
  CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
  USERNAME_PASSWORD_CREDENTIAL_TYPE,
} from 'gmp/models/credential.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import Wrapper from '../../components/layout/wrapper.js';

import EntityComponent from '../../entity/component.js';

import CredentialDialog from '../credentials/dialog.js';

import ScannerDialog from './dialog.js';

class ScannerComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.openCredentialDialog = this.openCredentialDialog.bind(this);
    this.openScannerDialog = this.openScannerDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleVerifyScanner = this.handleVerifyScanner.bind(this);
  }

  openScannerDialog(scanner) {
    const {gmp} = this.props;

    if (is_defined(scanner)) {
      gmp.scanner.get(scanner).then(response => {
        scanner = response.data;
        const state = {
          comment: scanner.comment,
          id: scanner.id,
          name: scanner.name,
          type: scanner.scanner_type,
          host: scanner.host,
          port: scanner.port,
          ca_pub: is_defined(scanner.ca_pub) ?
            scanner.ca_pub.certificate : undefined,
          scanner,
          which_cert: is_defined(scanner.ca_pub) ? 'existing' : 'default',
        };
        this.scanner_dialog.show(state, {
          title: _('Edit scanner {{name}}', {name: shorten(scanner.name)}),
        });
      });
    }
    else {
      this.scanner_dialog.show({});
    }

    gmp.credentials.getAll().then(credentials => {
      this.credentials = credentials;
      const credential_id = is_defined(scanner) &&
        is_defined(scanner.credential) ? scanner.credential.id : undefined;
      this.scanner_dialog.setValues({
        credentials,
        credential_id: select_save_id(credentials, credential_id),
      });
    });
  }

  openCredentialDialog(type) {
    const base = type === SLAVE_SCANNER_TYPE ?
      USERNAME_PASSWORD_CREDENTIAL_TYPE :
      CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
    this.credential_dialog.show({types: [base], base});
  }

  handleVerifyScanner(scanner) {
    const {gmp, onVerified, onVerifyError} = this.props;

    return gmp.scanner.verify(scanner).then(onVerified, response => {
      const message = is_defined(response.root) &&
        is_defined(response.root.get_scanner) &&
        is_defined(response.root.get_scanner.verify_scanner_response) ?
        response.root.get_scanner.verify_scanner_response._status_text :
        _('Unkown Error');

      if (is_defined(onVerifyError)) {
        onVerifyError(new Error(message));
      }
    });
  }

  handleCreateCredential(data) {
    const {gmp} = this.props;
    return gmp.credential.create(data).then(response => {
      const {credentials} = this;
      const credential = response.data;
      credentials.push(credential);
      this.scanner_dialog.setValues({
        credentials,
        credential_id: credential.id,
      });
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
        name="scanner"
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
              create: this.openScannerDialog,
              edit: this.openScannerDialog,
              verify: this.handleVerifyScanner,
            })}
            <ScannerDialog
              ref={ref => this.scanner_dialog = ref}
              onNewCredentialClick={this.openCredentialDialog}
              onSave={save}
            />
            <CredentialDialog
              ref={ref => this.credentials_dialog = ref}
              onSave={this.handleCreateCredential}
            />
          </Wrapper>
        )}
      </EntityComponent>
    );
  }
}

ScannerComponent.propTypes = {
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
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
};

export default withGmp(ScannerComponent);

// vim: set ts=2 sw=2 tw=80:
