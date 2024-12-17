/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {
  scannerTypeName,
  CVE_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DownloadKeyIcon from 'web/components/icon/downloadkeyicon';
import ExportIcon from 'web/components/icon/exporticon';
import VerifyIcon from 'web/components/icon/verifyicon';
import IconDivider from 'web/components/layout/icondivider';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import EntityLink from 'web/entity/link';
import useGmp from 'web/hooks/useGmp';
import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onScannerCertificateDownloadClick,
    onScannerCloneClick,
    onScannerCredentialDownloadClick,
    onScannerDeleteClick,
    onScannerDownloadClick,
    onScannerEditClick,
    onScannerVerifyClick,
  }) => (
    <IconDivider grow align={['start', 'center']}>
      <TrashIcon
        displayName={_('Scanner')}
        entity={entity}
        name="permission"
        onClick={onScannerDeleteClick}
      />
      <EditIcon
        displayName={_('Scanner')}
        entity={entity}
        name="permission"
        onClick={onScannerEditClick}
      />
      <CloneIcon
        displayName={_('Scanner')}
        entity={entity}
        mayClone={entity.isClonable()}
        name="permission"
        value={entity}
        onClick={onScannerCloneClick}
      />
      <ExportIcon
        title={_('Export Scanner')}
        value={entity}
        onClick={onScannerDownloadClick}
      />
      <VerifyIcon
        title={_('Verify Scanner')}
        value={entity}
        onClick={onScannerVerifyClick}
      />
      {isDefined(entity.credential) && (
        <DownloadKeyIcon
          title={_('Download Certificate')}
          value={entity}
          onClick={onScannerCredentialDownloadClick}
        />
      )}
      {isDefined(entity.caPub) && (
        <DownloadKeyIcon
          title={_('Download CA Certificate')}
          value={entity}
          onClick={onScannerCertificateDownloadClick}
        />
      )}
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onScannerCertificateDownloadClick: PropTypes.func.isRequired,
  onScannerCloneClick: PropTypes.func.isRequired,
  onScannerCredentialDownloadClick: PropTypes.func.isRequired,
  onScannerDeleteClick: PropTypes.func.isRequired,
  onScannerDownloadClick: PropTypes.func.isRequired,
  onScannerEditClick: PropTypes.func.isRequired,
  onScannerVerifyClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const gmp = useGmp();
  const isSensor = entity.scannerType === GREENBONE_SENSOR_SCANNER_TYPE;
  const showSensors = gmp.settings.enableGreenboneSensor && isSensor;
  return (
    <React.Fragment>
      {(showSensors || !isSensor) && (
        <TableRow>
          <EntityNameTableData
            displayName={_('Scanner')}
            entity={entity}
            link={links}
            type="scanner"
            onToggleDetailsClick={onToggleDetailsClick}
          />
          <TableData>
            {entity.scannerType !== CVE_SCANNER_TYPE &&
              !entity.hasUnixSocket() &&
              entity.host}
          </TableData>
          <TableData>
            {entity.scannerType !== CVE_SCANNER_TYPE &&
              !entity.hasUnixSocket() &&
              entity.port}
          </TableData>
          <TableData>{scannerTypeName(entity.scannerType)}</TableData>
          <TableData>
            {isDefined(entity.credential) && (
              <span>
                <EntityLink entity={entity.credential} />
              </span>
            )}
          </TableData>
          <ActionsComponent {...props} entity={entity} />
        </TableRow>
      )}
    </React.Fragment>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
