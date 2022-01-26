/* Copyright (C) 2019-2022 Greenbone Networks GmbH
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

import React from 'react';

import {connect} from 'react-redux';

import {isDefined} from 'gmp/utils/identity';

import EntityComponent from 'web/entity/component';

import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';

import {create_pem_certificate} from 'web/utils/cert';
import PropTypes from 'web/utils/proptypes';
import {generateFilename} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

class TlsCertificateComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleTlsCertificateDownload = this.handleTlsCertificateDownload.bind(
      this,
    );
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleTlsCertificateDownload(cert) {
    const {detailsExportFileName, gmp, username, onDownloaded} = this.props;

    return gmp.tlscertificate.get({id: cert.id}).then(response => {
      const {data} = response;

      const {
        creationTime,
        certificate,
        entityType,
        id,
        modificationTime,
        name,
      } = data;

      this.handleInteraction();

      const filename = generateFilename({
        creationTime,
        extension: 'pem', // this gets overwritten to .cer in chrome
        fileNameFormat: detailsExportFileName,
        id,
        modificationTime,
        resourceName: name,
        resourceType: entityType,
        username,
      });

      return onDownloaded({
        filename,
        mimetype: 'application/x-x509-ca-cert',
        data: create_pem_certificate(certificate),
      });
    });
  }

  render() {
    const {
      children,
      onDeleted,
      onDeleteError,
      onDownloaded,
      onDownloadError,
      onInteraction,
    } = this.props;

    return (
      <EntityComponent
        name="tlscertificate"
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onInteraction={onInteraction}
      >
        {({download, ...other}) => (
          <React.Fragment>
            {children({
              ...other,
              download: this.handleTlsCertificateDownload,
              exportFunc: download,
            })}
          </React.Fragment>
        )}
      </EntityComponent>
    );
  }
}

TlsCertificateComponent.propTypes = {
  children: PropTypes.func.isRequired,
  detailsExportFileName: PropTypes.string,
  gmp: PropTypes.gmp.isRequired,
  username: PropTypes.string,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
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

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(TlsCertificateComponent);

// vim: set ts=2 sw=2 tw=80:
