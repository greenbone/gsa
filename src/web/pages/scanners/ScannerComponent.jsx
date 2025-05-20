/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import {useState} from 'react';
import {useDispatch} from 'react-redux';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import CredentialsDialog from 'web/pages/credentials/Dialog';
import ScannerDialog from 'web/pages/scanners/Dialog';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';

const ScannerComponent = ({
  children,
  onCertificateDownloadError,
  onCertificateDownloaded,
  onCloneError,
  onCloned,
  onCreateError,
  onCreated,
  onCredentialDownloadError,
  onCredentialDownloaded,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onSaveError,
  onSaved,
  onVerified,
  onVerifyError,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const username = useShallowEqualSelector(getUsername);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const [credentialDialogVisible, setCredentialDialogVisible] = useState(false);
  const [scannerDialogVisible, setScannerDialogVisible] = useState(false);
  const [caPub, setCaPub] = useState(undefined);
  const [comment, setComment] = useState(undefined);
  const [credentialId, setCredentialId] = useState(undefined);
  const [credentials, setCredentials] = useState(undefined);
  const [host, setHost] = useState(undefined);
  const [id, setId] = useState(undefined);
  const [name, setName] = useState(undefined);
  const [port, setPort] = useState(undefined);
  const [scanner, setScanner] = useState(undefined);
  const [title, setTitle] = useState(undefined);
  const [type, setType] = useState(undefined);
  const [whichCert, setWhichCert] = useState(undefined);

  const onInteraction = () => {
    dispatch(renewSessionTimeout(gmp)());
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const openScannerDialog = scanner => {
    handleInteraction();

    const credPromise = gmp.credentials.getAll().then(response => {
      return response.data;
    });

    if (isDefined(scanner)) {
      Promise.all([credPromise, gmp.scanner.get(scanner)]).then(
        ([creds, response]) => {
          scanner = response.data;

          const scannerTitle = _('Edit Scanner {{name}}', {
            name: shorten(scanner.name),
          });

          setCaPub(
            isDefined(scanner.ca_pub) ? scanner.ca_pub.certificate : undefined,
          );
          setComment(scanner.comment);
          setCredentials(creds);
          setCredentialId(
            hasId(scanner.credential) ? scanner.credential.id : undefined,
          );
          setHost(scanner.host);
          setId(scanner.id);
          setName(scanner.name);
          setPort(scanner.port);
          setScannerDialogVisible(true);
          setScanner(scanner);
          setTitle(scannerTitle);
          setType(scanner.scannerType);
          setWhichCert(isDefined(scanner.ca_pub) ? 'existing' : 'default');
        },
      );
    } else {
      credPromise.then(creds => {
        setCaPub(undefined);
        setComment(undefined);
        setCredentialId(undefined);
        setCredentials(creds);
        setHost(undefined);
        setId(undefined);
        setName(undefined);
        setPort(undefined);
        setScanner(undefined);
        setScannerDialogVisible(true);
        setTitle(undefined);
        setType(undefined);
        setWhichCert(undefined);
      });
    }
  };

  const closeScannerDialog = () => {
    setScannerDialogVisible(false);
  };

  const handleCloseScannerDialog = () => {
    closeScannerDialog();
    handleInteraction();
  };

  const openCredentialsDialog = () => {
    setCredentialDialogVisible(true);
    handleInteraction();
  };

  const closeCredentialsDialog = () => {
    setCredentialDialogVisible(false);
  };

  const handleCloseCredentialsDialog = () => {
    closeCredentialsDialog();
    handleInteraction();
  };

  const handleVerifyFailure = response => {
    const message =
      isDefined(response.root) &&
      isDefined(response.root.action_result) &&
      isDefined(response.root.action_result.message)
        ? response.root.action_result.message
        : _('Unknown Error');

    if (isDefined(onVerifyError)) {
      onVerifyError(new Error(message));
    }
  };

  const handleVerifyScanner = scanner => {
    handleInteraction();

    return gmp.scanner
      .verify(scanner)
      .then(onVerified, response => handleVerifyFailure(response));
  };

  const handleCreateCredential = data => {
    handleInteraction();
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
        closeCredentialsDialog();
      });
  };

  const handleCredentialChange = credId => {
    setCredentialId(credId);
  };

  const handleDownloadCertificate = scanner => {
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
  };

  const handleDownloadCredential = scanner => {
    const {credential} = scanner;
    const {creationTime, entityType, id, modificationTime, name} = credential;

    handleInteraction();

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
  };

  const handleScannerTypeChange = (value, name) => {
    if (name === 'type') {
      setType(value);
    } else if (name === 'which_cert') {
      setWhichCert(value);
    }
  };

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
        <>
          {children({
            ...other,
            create: openScannerDialog,
            edit: openScannerDialog,
            verify: handleVerifyScanner,
            downloadcertificate: handleDownloadCertificate,
            downloadcredential: handleDownloadCredential,
          })}
          {scannerDialogVisible && (
            <ScannerDialog
              ca_pub={caPub}
              comment={comment}
              credential_id={credentialId}
              credentials={credentials}
              host={host}
              id={id}
              name={name}
              port={port}
              scanner={scanner}
              title={title}
              type={type}
              which_cert={whichCert}
              onClose={handleCloseScannerDialog}
              onCredentialChange={handleCredentialChange}
              onNewCredentialClick={openCredentialsDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeScannerDialog());
              }}
              onScannerTypeChange={handleScannerTypeChange}
            />
          )}
          {credentialDialogVisible && (
            <CredentialsDialog
              onClose={handleCloseCredentialsDialog}
              onSave={handleCreateCredential}
            />
          )}
        </>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onVerified: PropTypes.func,
  onVerifyError: PropTypes.func,
};

export default ScannerComponent;
