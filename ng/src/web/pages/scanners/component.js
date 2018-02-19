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
import {is_defined, shorten, select_save_id} from 'gmp/utils';

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

    this.state = {
      credentialDialogVisible: false,
      scannerDialogVisible: false,
    };

    this.closeCredentialDialog = this.closeCredentialDialog.bind(this);
    this.closeScannerDialog = this.closeScannerDialog.bind(this);
    this.openCredentialDialog = this.openCredentialDialog.bind(this);
    this.openScannerDialog = this.openScannerDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleDownloadCertificate = this.handleDownloadCertificate.bind(this);
    this.handleDownloadCredential = this.handleDownloadCredential.bind(this);
    this.handleVerifyScanner = this.handleVerifyScanner.bind(this);
  }

  openScannerDialog(scanner) {
    const {gmp} = this.props;

    if (is_defined(scanner)) {
      gmp.scanner.get(scanner).then(response => {
        scanner = response.data;

        const title = _('Edit scanner {{name}}', {name: shorten(scanner.name)});

        this.setState({
          ca_pub: is_defined(scanner.ca_pub) ?
            scanner.ca_pub.certificate : undefined,
            scannerDialogVisible: true,
          scanner,
          title,
          type: scanner.scanner_type,
          which_cert: is_defined(scanner.ca_pub) ? 'existing' : 'default',
        });
      });
    }
    else {
      this.setState({scannerDialogVisible: true});
    }

    gmp.credentials.getAll().then(response => {
      const {data: credentials} = response;
      this.credentials = credentials;
      const credential_id = is_defined(scanner) &&
        is_defined(scanner.credential) ? scanner.credential.id : undefined;
      this.setState({
        credentials,
        credential_id: select_save_id(credentials, credential_id),
      });
    });
  }

  closeScannerDialog() {
    this.setState({scannerDialogVisible: false});
  }

  openCredentialDialog(type) {
    const base = type === SLAVE_SCANNER_TYPE ?
      USERNAME_PASSWORD_CREDENTIAL_TYPE :
      CLIENT_CERTIFICATE_CREDENTIAL_TYPE;
    this.setState({
      base,
      credentialDialogVisible: true,
      types: [base],
    });
  }

  closeCredentialDialog() {
    this.setState({credentialDialogVisible: false});
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
      this.setState({
        credentials,
        credential_id: credential.id,
      });
    });
  }

  handleDownloadCertificate(scanner) {
    const {onCertificateDownloaded} = this.props;
    const {id, name, ca_pub} = scanner;

    const filename = 'scanner-' + name + '-' + id + '-ca-pub.pem';
    return onCertificateDownloaded({filename, data: ca_pub.certificate});
  }

  handleDownloadCredential(scanner) {
    const {onCredentialDownloaded, onCredentialDownloadError, gmp} = this.props;
    const {credential} = scanner;
    const {name, id} = credential;

    return gmp.credential.download(credential, 'pem').then(response => {
      const filename = 'scanner-credential-' + name + '-' + id + '.pem';
      return {filename, data: response.data};
    }).then(onCredentialDownloaded, onCredentialDownloadError);
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
      ca_pub,
      credentials,
      credentialDialogVisible,
      credential_id,
      scannerDialogVisible,
      scanner,
      title,
      type,
      which_cert,
    } = this.state;

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
              downloadcertificate: this.handleDownloadCertificate,
              downloadcredential: this.handleDownloadCredential,
            })}
            <ScannerDialog
              ca_pub={ca_pub}
              credentials={credentials}
              credential_id={credential_id}
              visible={scannerDialogVisible}
              scanner={scanner}
              title={title}
              type={type}
              which_cert={which_cert}
              onClose={this.closeScannerDialog}
              onNewCredentialClick={this.openCredentialDialog}
              onSave={save}
            />
            <CredentialDialog
              visible={credentialDialogVisible}
              onClose={this.closeCredentialDialog}
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
  onCertificateDownloadError: PropTypes.func,
  onCertificateDownloaded: PropTypes.func,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onCredentialDownloadError: PropTypes.func,
  onCredentialDownloaded: PropTypes.func,
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
