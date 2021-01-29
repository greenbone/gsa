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
import React from 'react';

import _ from 'gmp/locale';

import {scannerTypeName, CVE_SCANNER_TYPE} from 'gmp/models/scanner';

import {isDefined} from 'gmp/utils/identity';

import IconDivider from 'web/components/layout/icondivider';

import DownloadKeyIcon from 'web/components/icon/downloadkeyicon';
import ExportIcon from 'web/components/icon/exporticon';
import VerifyIcon from 'web/components/icon/verifyicon';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import EntityLink from 'web/entity/link';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

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
    <IconDivider align={['start', 'center']} grow>
      <TrashIcon
        displayName={_('Scanner')}
        name="permission"
        entity={entity}
        onClick={onScannerDeleteClick}
      />
      <EditIcon
        displayName={_('Scanner')}
        name="permission"
        entity={entity}
        onClick={onScannerEditClick}
      />
      <CloneIcon
        displayName={_('Scanner')}
        name="permission"
        entity={entity}
        value={entity}
        mayClone={entity.isClonable()}
        onClick={onScannerCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Scanner')}
        onClick={onScannerDownloadClick}
      />
      <VerifyIcon
        value={entity}
        title={_('Verify Scanner')}
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
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="scanner"
      displayName={_('Scanner')}
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
);

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
