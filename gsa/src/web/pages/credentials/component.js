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

import {ALL_CREDENTIAL_TYPES} from 'gmp/models/credential';

import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';

import EntityComponent from 'web/entity/component';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import PropTypes from 'web/utils/proptypes';
import {generateFilename} from 'web/utils/render';
import useGmp from 'web/utils/useGmp';
import useUserName from 'web/utils/useUserName';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import CredentialsDialog from './dialog';

const CredentialsComponent = ({
  children,
  onCreateError,
  onCreated,
  onCloneError,
  onCloned,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onInstallerDownloadError,
  onInstallerDownloaded,
  onSaved,
  onSaveError,
}) => {
  const dispatch = useDispatch();
  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const userName = useUserName();
  const gmp = useGmp();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  const [credentialDialogState, setCredentialDialogState] = useState({
    allowedCredentialTypes: ALL_CREDENTIAL_TYPES,
    visible: false,
    title: _('New Credential'),
  });

  const loadSettings = useCallback(
    () => dispatch(loadUserSettingDefaults(gmp)()),
    [dispatch, gmp],
  );

  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  useEffect(() => {
    // load settings on mount
    loadSettings();
  }, [loadSettings]);

  const handleCloseCredentialDialog = useCallback(() => {
    setCredentialDialogState(state => ({...state, visible: false}));
    renewSessionTimeout();
  }, [renewSessionTimeout]);

  const openCredentialsDialog = useCallback(
    // eslint-disable-next-line no-shadow
    credential => {
      if (isDefined(credential)) {
        setCredentialDialogState(state => ({
          ...state,
          title: _('Edit Credential {{name}}', {
            name: shorten(credential.name),
          }),
          allowInsecure: credential.allow_insecure,
          allowedCredentialTypes: [credential.credential_type],
          authAlgorithm: credential.auth_algorithm,
          comment: credential.comment,
          credential,
          credentialLogin: credential.login,
          credentialName: credential.name,
          credentialType: credential.credential_type,
          privacyAlgorithm: isDefined(credential.privacy)
            ? credential.privacy.algorithm
            : undefined,
          visible: true,
        }));
      } else {
        // reset all values in state to not show values from last edit
        setCredentialDialogState(state => ({
          ...state,
          title: _('New Credential'),
          allowInsecure: undefined,
          allowedCredentialTypes: ALL_CREDENTIAL_TYPES,
          authAlgorithm: undefined,
          comment: undefined,
          credential: undefined,
          credentialLogin: undefined,
          credentialName: undefined,
          credentialType: undefined,
          privacyAlgorithm: undefined,
          visible: true,
        }));
      }

      renewSessionTimeout();
    },
    [renewSessionTimeout],
  );

  const handleDownloadInstaller = useCallback(
    // eslint-disable-next-line no-shadow
    (credential, format) => {
      renewSessionTimeout();

      return gmp.credential
        .download(credential, format)
        .then(response => {
          const {
            creationTime,
            entityType,
            id,
            modificationTime,
            name,
          } = credential;
          const filename = generateFilename({
            creationTime: creationTime,
            extension: format,
            fileNameFormat: detailsExportFileName,
            id: id,
            modificationTime,
            resourceName: name,
            resourceType: entityType,
            username: userName,
          });
          return {filename, data: response.data};
        })
        .then(onInstallerDownloaded, onInstallerDownloadError);
    },
    [
      detailsExportFileName,
      renewSessionTimeout,
      gmp.credential,
      userName,
      onInstallerDownloadError,
      onInstallerDownloaded,
    ],
  );
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
      onInteraction={renewSessionTimeout}
      onSaved={onSaved}
      onSaveError={onSaveError}
    >
      {({save, ...other}) => (
        <React.Fragment>
          {children({
            ...other,
            create: openCredentialsDialog,
            edit: openCredentialsDialog,
            downloadinstaller: handleDownloadInstaller,
          })}

          {credentialDialogState.visible && (
            <CredentialsDialog
              title={credentialDialogState.title}
              allow_insecure={credentialDialogState.allowInsecure}
              auth_algorithm={credentialDialogState.authAlgorithm}
              comment={credentialDialogState.comment}
              credential={credentialDialogState.credential}
              credential_login={credentialDialogState.credentialLogin}
              credential_type={credentialDialogState.credentialType}
              name={credentialDialogState.credentialName}
              privacy_algorithm={credentialDialogState.privacyAlgorithm}
              types={credentialDialogState.allowedCredentialTypes}
              onClose={handleCloseCredentialDialog}
              onSave={d => save(d).then(handleCloseCredentialDialog)}
            />
          )}
        </React.Fragment>
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
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
};

export default CredentialsComponent;

// vim: set ts=2 sw=2 tw=80:
