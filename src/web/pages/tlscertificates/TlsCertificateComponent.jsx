/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {isDefined} from 'gmp/utils/identity';
import EntityComponent from 'web/entity/EntityComponent';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import {create_pem_certificate} from 'web/utils/Cert';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';

const TlsCertificateComponent = ({
  children,
  onDeleted,
  onDeleteError,
  onDownloaded,
  onDownloadError,
}) => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const userDefaultsSelector = useShallowEqualSelector(getUserSettingsDefaults);
  const username = useSelector(getUsername);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const onInteraction = () => {
    dispatch(renewSessionTimeout(gmp)());
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleTlsCertificateDownload = cert => {
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

      handleInteraction();

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
  };

  return (
    <EntityComponent
      name="tlscertificate"
      onDeleteError={onDeleteError}
      onDeleted={onDeleted}
      onDownloadError={onDownloadError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
    >
      {({download, ...other}) => (
        <>
          {children({
            ...other,
            download: handleTlsCertificateDownload,
            exportFunc: download,
          })}
        </>
      )}
    </EntityComponent>
  );
};

TlsCertificateComponent.propTypes = {
  children: PropTypes.func.isRequired,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
};

export default TlsCertificateComponent;
