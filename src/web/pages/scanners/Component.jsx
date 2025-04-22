/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import {connect} from 'react-redux';
import EntityComponent from 'web/entity/EntityComponent';
import CredentialsDialog from 'web/pages/credentials/Dialog';
import ScannerDialog from 'web/pages/scanners/Dialog';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

class ScannerComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      credentialDialogVisible: false,
      scannerDialogVisible: false,
    };

    this.handleCloseCredentialsDialog =
      this.handleCloseCredentialsDialog.bind(this);
    this.handleCloseScannerDialog = this.handleCloseScannerDialog.bind(this);
    this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
    this.openScannerDialog = this.openScannerDialog.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleCredentialChange = this.handleCredentialChange.bind(this);
    this.handleDownloadCertificate = this.handleDownloadCertificate.bind(this);
    this.handleDownloadCredential = this.handleDownloadCredential.bind(this);
    this.handleScannerTypeChange = this.handleScannerTypeChange.bind(this);
    this.handleVerifyScanner = this.handleVerifyScanner.bind(this);
  }

  openScannerDialog(scanner) {
    const {gmp} = this.props;
    const {_} = this.props;

    this.handleInteraction();

    const credPromise = gmp.credentials.getAll().then(response => {
      return response.data;
    });
    if (isDefined(scanner)) {
      Promise.all([credPromise, gmp.scanner.get(scanner)]).then(
        ([credentials, response]) => {
          scanner = response.data;

          const title = _('Edit Scanner {{name}}', {
            name: shorten(scanner.name),
          });
          this.setState({
            ca_pub: isDefined(scanner.ca_pub)
              ? scanner.ca_pub.certificate
              : undefined,
            comment: scanner.comment,
            credentials,
            credential_id: hasId(scanner.credential)
              ? scanner.credential.id
              : undefined,
            host: scanner.host,
            id: scanner.id,
            name: scanner.name,
            port: scanner.port,
            scannerDialogVisible: true,
            scanner,
            title,
            type: scanner.scannerType,
            which_cert: isDefined(scanner.ca_pub) ? 'existing' : 'default',
          });
        },
      );
    } else {
      credPromise.then(credentials =>
        this.setState({
          ca_pub: undefined,
          comment: undefined,
          credential_id: undefined,
          credentials,
          host: undefined,
          id: undefined,
          name: undefined,
          port: undefined,
          scanner: undefined,
          scannerDialogVisible: true,
          title: undefined,
          type: undefined,
          which_cert: undefined,
        }),
      );
    }
  }

  closeScannerDialog() {
    this.setState({scannerDialogVisible: false});
  }

  handleCloseScannerDialog() {
    this.closeScannerDialog();
    this.handleInteraction();
  }

  openCredentialsDialog() {
    this.handleInteraction();
  }

  closeCredentialsDialog() {
    this.setState({credentialDialogVisible: false});
  }

  handleCloseCredentialsDialog() {
    this.closeCredentialsDialog();
    this.handleInteraction();
  }

  handleVerifyFailure(response) {
    const {onVerifyError} = this.props;
    const {_} = this.props;

    const message =
      isDefined(response.root) &&
      isDefined(response.root.action_result) &&
      isDefined(response.root.action_result.message)
        ? response.root.action_result.message
        : _('Unknown Error');

    if (isDefined(onVerifyError)) {
      onVerifyError(new Error(message));
    }
  }

  handleVerifyScanner(scanner) {
    const {gmp, onVerified} = this.props;

    this.handleInteraction();

    return gmp.scanner
      .verify(scanner)
      .then(onVerified, response => this.handleVerifyFailure(response));
  }

  handleCreateCredential(data) {
    const {gmp} = this.props;
    let credential;

    this.handleInteraction();

    return gmp.credential
      .create(data)
      .then(response => {
        credential = response.data;
      })
      .then(() => gmp.credentials.getAll())
      .then(response => {
        this.setState({
          credentials: response.data,
          credential_id: credential.id,
        });
        this.closeCredentialsDialog();
      });
  }

  handleCredentialChange(credential_id) {
    this.setState({credential_id});
  }

  handleDownloadCertificate(scanner) {
    const {detailsExportFileName, username, onCertificateDownloaded} =
      this.props;
    const {creationTime, entityType, id, modificationTime, name, ca_pub} =
      scanner;
    const filename = generateFilename({
      creationTime: creationTime,
      extension: 'pem',
      fileNameFormat: detailsExportFileName,
      id: id,
      modificationTime,
      resourceName: name,
      resourceType: entityType,
      username,
    });
    return onCertificateDownloaded({filename, data: ca_pub.certificate});
  }

  handleDownloadCredential(scanner) {
    const {
      detailsExportFileName,
      username,
      onCredentialDownloaded,
      onCredentialDownloadError,
      gmp,
    } = this.props;
    const {credential} = scanner;
    const {creationTime, entityType, id, modificationTime, name} = credential;

    this.handleInteraction();

    return gmp.credential
      .download(credential, 'pem')
      .then(response => {
        const filename = generateFilename({
          creationTime: creationTime,
          extension: 'pem',
          fileNameFormat: detailsExportFileName,
          id: id,
          modificationTime,
          resourceName: name,
          resourceType: entityType,
          username,
        });
        return {filename, data: response.data};
      })
      .then(onCredentialDownloaded, onCredentialDownloadError);
  }

  handleScannerTypeChange(value, name) {
    this.setState({[name]: value});
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
      ca_pub,
      comment,
      credential_id,
      credentialDialogVisible,
      credentials,
      credentialTypes,
      host,
      id,
      name,
      port,
      scannerDialogVisible,
      scanner,
      title,
      type,
      which_cert,
    } = this.state;

    return (
      <EntityComponent
        name="scanner"
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
              create: this.openScannerDialog,
              edit: this.openScannerDialog,
              verify: this.handleVerifyScanner,
              downloadcertificate: this.handleDownloadCertificate,
              downloadcredential: this.handleDownloadCredential,
            })}
            {scannerDialogVisible && (
              <ScannerDialog
                ca_pub={ca_pub}
                comment={comment}
                credential_id={credential_id}
                credentials={credentials}
                host={host}
                id={id}
                name={name}
                port={port}
                scanner={scanner}
                title={title}
                type={type}
                which_cert={which_cert}
                onClose={this.handleCloseScannerDialog}
                onCredentialChange={this.handleCredentialChange}
                onNewCredentialClick={this.openCredentialsDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeScannerDialog());
                }}
                onScannerTypeChange={this.handleScannerTypeChange}
              />
            )}
            {credentialDialogVisible && (
              <CredentialsDialog
                types={credentialTypes}
                onClose={this.handleCloseCredentialsDialog}
                onSave={this.handleCreateCredential}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

ScannerComponent.propTypes = {
  children: PropTypes.func.isRequired,
  detailsExportFileName: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  username: PropTypes.string,
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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
  _: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const username = getUsername(rootState);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );
  return {
    detailsExportFileName,
    username,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
  onInteraction: () => dispatch(renewSessionTimeout(gmp)()),
});

export default compose(withTranslation, withGmp, connect(mapStateToProps, mapDispatchToProps))(ScannerComponent);
