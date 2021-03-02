/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import React, {useCallback, useEffect} from 'react';

import {useSelector, useDispatch} from 'react-redux';

import EntityComponent from 'web/entity/component';

import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import {create_pem_certificate} from 'web/utils/cert';
import PropTypes from 'web/utils/proptypes';
import {generateFilename} from 'web/utils/render';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useGmp from 'web/utils/useGmp';
import useUserName from 'web/utils/useUserName';

const TlsCertificateComponent = ({
  children,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
}) => {
  const gmp = useGmp();
  const username = useUserName();
  const dispatch = useDispatch();
  const [, renewSession] = useUserSessionTimeout();

  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const loadSettings = useCallback(
    () => dispatch(loadUserSettingDefaults(gmp)()),
    [dispatch, gmp],
  );

  useEffect(() => {
    // load settings on mount
    loadSettings();
  }, [loadSettings]);

  const handleTlsCertificateDownload = useCallback(
    cert =>
      gmp.tlscertificate.get({id: cert.id}).then(response => {
        const {data} = response;

        const {
          creationTime,
          certificate,
          entityType,
          id,
          modificationTime,
          name,
        } = data;

        renewSession();

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
      }, onDownloadError),
    [
      detailsExportFileName,
      gmp.tlscertificate,
      username,
      renewSession,
      onDownloaded,
      onDownloadError,
    ],
  );
  return (
    <EntityComponent
      name="tlscertificate"
      onDeleted={onDeleted}
      onDeleteError={onDeleteError}
      onDownloaded={onDownloaded}
      onDownloadError={onDownloadError}
    >
      {({download, ...other}) => (
        <React.Fragment>
          {children({
            ...other,
            download: handleTlsCertificateDownload,
            exportFunc: download,
          })}
        </React.Fragment>
      )}
    </EntityComponent>
  );
};

TlsCertificateComponent.propTypes = {
  children: PropTypes.func.isRequired,
  detailsExportFileName: PropTypes.string,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
};

export default TlsCertificateComponent;
// vim: set ts=2 sw=2 tw=80:
