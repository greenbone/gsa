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
import React, {useCallback, useState, useEffect} from 'react';

import {useDispatch, useSelector} from 'react-redux';

import _ from 'gmp/locale';

<<<<<<< HEAD
import {CLIENT_CERTIFICATE_CREDENTIAL_TYPE} from 'gmp/models/credential';

import {OSP_SCANNER_TYPE} from 'gmp/models/scanner';

import {hasId} from 'gmp/utils/id';
=======
>>>>>>> 936e7fb213... Fix setting default scanner type to Greenbone Sensor
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import EntityComponent from 'web/entity/component';

import CredentialsDialog from 'web/pages/credentials/dialog';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import PropTypes from 'web/utils/proptypes';
import {generateFilename} from 'web/utils/render';
import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserName from 'web/utils/useUserName';

import ScannerDialog from './dialog';

const ScannerComponent = ({
  children,
  onCertificateDownloaded,
  onCloned,
  onCloneError,
  onCreated,
  onCreateError,
  onCredentialDownloaded,
  onCredentialDownloadError,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
  onInteraction,
  onSaved,
  onSaveError,
  onVerified,
  onVerifyError,
}) => {
  const gmp = useGmp();
  const reduxDispatch = useDispatch();
  const userName = useUserName();
  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const [, renewSessionTimeout] = useUserSessionTimeout();

  const [credentials, setCredentials] = useState([]);
  const [credentialId, setCredentialId] = useState();
  const [credentialTypes, setCredentialTypes] = useState();

  const [scannerDialogState, setScannerDialogState] = useState({});
  const [credentialDialogVisible, setCredentialDialogVisible] = useState(false);

  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

<<<<<<< HEAD
  // eslint-disable-next-line no-shadow
  const openCredentialsDialog = useCallback(() => {
    setCredentialTypes([CLIENT_CERTIFICATE_CREDENTIAL_TYPE]);
    setCredentialDialogVisible(true);
  }, []);

  const handleCloseCredentialsDialog = useCallback(() => {
    setCredentialDialogVisible(false);
    renewSessionTimeout();
  }, [renewSessionTimeout]);

  const handleDownloadCertificate = useCallback(
    // eslint-disable-next-line no-shadow
    scanner => {
      const {
        creationTime,
        entityType,
        id,
        modificationTime,
        name,
        ca_pub,
      } = scanner;
      const filename = generateFilename({
        creationTime: creationTime,
        extension: 'pem',
        fileNameFormat: detailsExportFileName,
        id: id,
        modificationTime,
        resourceName: name,
        resourceType: entityType,
        username: userName,
=======
class ScannerComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      credentialDialogVisible: false,
      scannerDialogVisible: false,
    };

    this.handleCloseCredentialsDialog = this.handleCloseCredentialsDialog.bind(
      this,
    );
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

    this.setState({
      base: CLIENT_CERTIFICATE_CREDENTIAL_TYPE,
      credentialDialogVisible: true,
      credentialTypes: [CLIENT_CERTIFICATE_CREDENTIAL_TYPE],
    });
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
>>>>>>> 936e7fb213... Fix setting default scanner type to Greenbone Sensor
      });

      renewSessionTimeout();

      return onCertificateDownloaded({filename, data: ca_pub.certificate});
    },
    [
      onCertificateDownloaded,
      userName,
      detailsExportFileName,
      renewSessionTimeout,
    ],
  );

  const handleDownloadCredential = useCallback(
    // eslint-disable-next-line no-shadow
    scanner => {
      const {credential} = scanner;
      const {creationTime, entityType, id, modificationTime, name} = credential;

      renewSessionTimeout();

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
            username: userName,
          });
          return {filename, data: response.data};
        })
        .then(onCredentialDownloaded, onCredentialDownloadError);
    },
    [
      gmp.credential,
      userName,
      detailsExportFileName,
      renewSessionTimeout,
      onCredentialDownloadError,
      onCredentialDownloaded,
    ],
  );

  const handleCreateCredential = useCallback(
    data => {
      let credential;

      return gmp.credential
        .create(data)
        .then(response => {
          credential = response.data;
        })
        .then(() => gmp.credentials.getAll())
        .then(response => {
          setCredentials(response.data);
          setCredentialId(credential.id);

          handleCloseCredentialsDialog();
        });
    },
    [handleCloseCredentialsDialog, gmp],
  );

  const handleCredentialChange = useCallback(credential_id => {
    setCredentialId(credential_id);
  }, []);

  const handleVerifyFailure = useCallback(
    response => {
      const message =
        isDefined(response.root) &&
        isDefined(response.root.action_result) &&
        isDefined(response.root.action_result.message)
          ? response.root.action_result.message
          : _('Unknown Error');

      if (isDefined(onVerifyError)) {
        onVerifyError(new Error(message));
      }
    },
    [onVerifyError],
  );

  const handleVerifyScanner = useCallback(
    // eslint-disable-next-line no-shadow
    scanner => {
      renewSessionTimeout();

      return gmp.scanner
        .verify(scanner)
        .then(onVerified, response => handleVerifyFailure(response));
    },
    [renewSessionTimeout, handleVerifyFailure, onVerified, gmp.scanner],
  );

  const handleCloseScannerDialog = useCallback(() => {
    setScannerDialogState(state => ({...state, visible: false}));
    renewSessionTimeout();
  }, [renewSessionTimeout]);

  const openScannerDialog = useCallback(
    // eslint-disable-next-line no-shadow
    scanner => {
      renewSessionTimeout();

      const credPromise = gmp.credentials.getAll().then(response => {
        return response.data;
      });

      if (isDefined(scanner)) {
        Promise.all([credPromise, gmp.scanner.get(scanner)]).then(
          ([loadedCredentials, response]) => {
            scanner = response.data;

            setScannerDialogState(state => ({
              ...state,
              caPub: isDefined(scanner.ca_pub)
                ? scanner.ca_pub.certificate
                : undefined,
              comment: scanner.comment,
              scanner,
              host: scanner.host,
              id: scanner.id,
              name: scanner.name,
              port: scanner.port,
              type: scanner.scannerType,
              title: _('Edit Scanner {{name}}', {
                name: shorten(scanner.name),
              }),
              whichCert: isDefined(scanner.ca_pub) ? 'existing' : 'default',
              visible: true,
            }));

            setCredentials(loadedCredentials);
            setCredentialId(
              hasId(scanner.credential) ? scanner.credential.id : undefined,
            );
          },
        );
      } else {
        credPromise.then(loadedCredentials => {
          setCredentials(loadedCredentials);
          setCredentialId(undefined);

          setScannerDialogState(state => ({
            ...state,
            caPub: undefined,
            comment: undefined,
            scanner: undefined,
            host: undefined,
            id: undefined,
            name: undefined,
            port: undefined,
            type: OSP_SCANNER_TYPE,
            title: undefined, // use default title from dialog
            whichCert: undefined,
            visible: true,
          }));
        });
      }
    },
    [gmp.credentials, gmp.scanner, renewSessionTimeout],
  );

  const handleScannerTypeChange = useCallback(
    (newScannerType, newCredentialId) => {
      setCredentialId(newCredentialId);
      setScannerDialogState(state => ({...state, type: newScannerType}));
    },
    [],
  );

  useEffect(() => {
    reduxDispatch(loadUserSettingDefaults(gmp)());
  }, [reduxDispatch, gmp]);
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
      onInteraction={onInteraction}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({save, ...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openScannerDialog,
            edit: openScannerDialog,
            verify: handleVerifyScanner,
            downloadcertificate: handleDownloadCertificate,
            downloadcredential: handleDownloadCredential,
          })}
          {scannerDialogState.visible && (
            <ScannerDialog
              ca_pub={scannerDialogState.caPub}
              comment={scannerDialogState.comment}
              credentials={credentials}
              credential_id={credentialId}
              host={scannerDialogState.host}
              id={scannerDialogState.id}
              name={scannerDialogState.name}
              port={scannerDialogState.port}
              scanner={scannerDialogState.scanner}
              title={scannerDialogState.title}
              type={scannerDialogState.type}
              which_cert={scannerDialogState.whichCert}
              onClose={handleCloseScannerDialog}
              onCredentialChange={handleCredentialChange}
              onNewCredentialClick={openCredentialsDialog}
              onSave={d => save(d).then(handleCloseScannerDialog)}
              onScannerTypeChange={handleScannerTypeChange}
            />
          )}
          {credentialDialogVisible && (
            <CredentialsDialog
              types={credentialTypes}
              onClose={handleCloseCredentialsDialog}
              onSave={handleCreateCredential}
            />
          )}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

ScannerComponent.propTypes = {
  children: PropTypes.func.isRequired,
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
};

export default ScannerComponent;

// vim: set ts=2 sw=2 tw=80:
