/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ALL_CREDENTIAL_TYPES} from 'gmp/models/credential';
import {isDefined} from 'gmp/utils/identity';
import {shorten} from 'gmp/utils/string';
import React from 'react';
import {connect} from 'react-redux';
import EntityComponent from 'web/entity/EntityComponent';
import CredentialsDialog from 'web/pages/credentials/Dialog';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';
import withTranslation from 'web/utils/withTranslation';

class CredentialComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {dialogVisible: false};

    this.handleCloseCredentialDialog =
      this.handleCloseCredentialDialog.bind(this);
    this.openCredentialsDialog = this.openCredentialsDialog.bind(this);
    this.handleDownloadInstaller = this.handleDownloadInstaller.bind(this);
  }

  openCredentialsDialog(credential) {
    const {_} = this.props;

    if (isDefined(credential)) {
      const title = _('Edit Credential {{name}}', {
        name: shorten(credential.name),
      });

      this.setState({
        allow_insecure: credential.allow_insecure,
        comment: credential.comment,
        credential,
        credential_type: credential.credential_type,
        auth_algorithm: credential.auth_algorithm,
        name: credential.name,
        credential_login: credential.login,
        privacy_algorithm: isDefined(credential.privacy)
          ? credential.privacy.algorithm
          : undefined,
        types: [credential.credential_type],
        dialogVisible: true,
        title,
      });
    } else {
      // reset all values in state to not show values from last edit
      this.setState({
        allow_insecure: undefined,
        comment: undefined,
        credential: undefined,
        credential_type: undefined,
        auth_algorithm: undefined,
        name: undefined,
        credential_login: undefined,
        privacy_algorithm: undefined,
        types: ALL_CREDENTIAL_TYPES,
        dialogVisible: true,
        title: _('New Credential'),
      });
    }

    this.handleInteraction();
  }

  closeCredentialDialog() {
    this.setState({dialogVisible: false});
  }

  handleCloseCredentialDialog() {
    this.closeCredentialDialog();
    this.handleInteraction();
  }

  handleDownloadInstaller(credential, format) {
    const {
      detailsExportFileName,
      gmp,
      username,
      onInstallerDownloaded,
      onInstallerDownloadError,
    } = this.props;

    this.handleInteraction();

    return gmp.credential
      .download(credential, format)
      .then(response => {
        const {creationTime, entityType, id, modificationTime, name} =
          credential;
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

    const {dialogVisible, ...dialogProps} = this.state;

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
          <React.Fragment>
            {children({
              ...other,
              create: this.openCredentialsDialog,
              edit: this.openCredentialsDialog,
              downloadinstaller: this.handleDownloadInstaller,
            })}

            {dialogVisible && (
              <CredentialsDialog
                {...dialogProps}
                onClose={this.handleCloseCredentialDialog}
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeCredentialDialog());
                }}
              />
            )}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

CredentialComponent.propTypes = {
  children: PropTypes.func.isRequired,
  detailsExportFileName: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  username: PropTypes.string,
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
  _: PropTypes.func.isRequired,
});

export default compose(
  withTranslation,
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(CredentialComponent);
