/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {ALL_CREDENTIAL_TYPES} from 'gmp/models/credential';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import CredentialsDialog from 'web/pages/credentials/Dialog';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';

const CredentialsComponent = ({
  children,
  onCloneError,
  onCloned,
  onCreateError,
  onCreated,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onInstallerDownloadError,
  onInstallerDownloaded,
  onInteraction,
  onSaveError,
  onSaved,
}) => {
  const gmp = useGmp();
  const [_] = useTranslation();
  const dispatch = useDispatch();

  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const username = useSelector(getUsername);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const [dialogVisible, setDialogVisible] = useState(false);

  const [allowInsecure, setAllowInsecure] = useState();
  const [comment, setComment] = useState();
  const [credential, setCredential] = useState();
  const [credentialType, setCredentialType] = useState();
  const [authAlgorithm, setAuthAlgorithm] = useState();
  const [name, setName] = useState();
  const [credentialLogin, setCredentialLogin] = useState();
  const [privacyAlgorithm, setPrivacyAlgorithm] = useState();
  const [types, setTypes] = useState(ALL_CREDENTIAL_TYPES);
  const [title, setTitle] = useState('');

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
      dispatch(renewSessionTimeout(gmp)());
    }
  };

  const openCredentialsDialog = credential => {
    if (isDefined(credential)) {
      const dialogTitle = _('Edit Credential {{name}}', {
        name: shorten(credential.name),
      });

      setAllowInsecure(credential.allow_insecure);
      setComment(credential.comment);
      setCredential(credential);
      setCredentialType(credential.credential_type);
      setAuthAlgorithm(credential.auth_algorithm);
      setName(credential.name);
      setCredentialLogin(credential.login);
      setPrivacyAlgorithm(
        isDefined(credential.privacy)
          ? credential.privacy.algorithm
          : undefined,
      );
      setTypes([credential.credential_type]);
      setTitle(dialogTitle);
    } else {
      // reset all values in state to not show values from last edit
      setAllowInsecure(undefined);
      setComment(undefined);
      setCredential(undefined);
      setCredentialType(undefined);
      setAuthAlgorithm(undefined);
      setName(undefined);
      setCredentialLogin(undefined);
      setPrivacyAlgorithm(undefined);
      setTypes(ALL_CREDENTIAL_TYPES);
      setTitle(_('New Credential'));
    }

    setDialogVisible(true);
    handleInteraction();
  };

  const closeCredentialDialog = () => {
    setDialogVisible(false);
  };

  const handleCloseCredentialDialog = () => {
    closeCredentialDialog();
    handleInteraction();
  };

  const handleDownloadInstaller = (cred, format) => {
    handleInteraction();

    return gmp.credential
      .download(cred, format)
      .then(response => {
        const {creationTime, entityType, id, modificationTime, name} = cred;
        const filename = generateFilename({
          creationTime: creationTime,
          extension: format,
          fileNameFormat: detailsExportFileName,
          id: id,
          modificationTime,
          resourceName: name,
          resourceType: entityType,
          username,
        });
        return {filename, data: response.data};
      })
      .then(onInstallerDownloaded, onInstallerDownloadError);
  };

  const dialogProps = {
    allow_insecure: allowInsecure,
    comment,
    credential,
    credential_type: credentialType,
    auth_algorithm: authAlgorithm,
    name,
    credential_login: credentialLogin,
    privacy_algorithm: privacyAlgorithm,
    types,
    title,
  };

  return (
    <EntityComponent
      name="credential"
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
            create: openCredentialsDialog,
            edit: openCredentialsDialog,
            downloadinstaller: handleDownloadInstaller,
          })}

          {dialogVisible && (
            <CredentialsDialog
              {...dialogProps}
              onClose={handleCloseCredentialDialog}
              onSave={d => {
                handleInteraction();
                return save(d).then(() => closeCredentialDialog());
              }}
            />
          )}
        </>
      )}
    </EntityComponent>
  );
};

CredentialsComponent.propTypes = {
  children: PropTypes.func.isRequired,
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
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default CredentialsComponent;
