/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';
import EntityLink from '../../entity/link.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import Icon from '../../components/icon/icon.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import {scanner_type_name, CVE_SCANNER_TYPE} from 'gmp/models/scanner.js';


const Actions = ({
  entity,
  onScannerCertificateDownloadClick,
  onScannerCloneClick,
  onScannerCredentialDownloadClick,
  onScannerDeleteClick,
  onScannerDownloadClick,
  onScannerEditClick,
  onScannerVerifyClick,
}) => (
  <IconDivider
    align={['start', 'center']}
    grow
  >
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
      onClick={onScannerEditClick}/>
    <CloneIcon
      displayName={_('Scanner')}
      name="permission"
      entity={entity}
      value={entity}
      mayClone={entity.isClonable()}
      onClick={onScannerCloneClick}/>
    <ExportIcon
      value={entity}
      title={_('Export Scanner')}
      onClick={onScannerDownloadClick}
    />
    <Icon
      img="verify.svg"
      value={entity}
      title={_('Verify Scanner')}
      onClick={onScannerVerifyClick}
    />
    {is_defined(entity.credential) &&
      <Icon
        title={_('Download Certificate')}
        img="key.svg"
        value={entity}
        onClick={onScannerCredentialDownloadClick}
      />
    }
    {is_defined(entity.ca_pub) &&
      <Icon
        img="key.svg"
        title={_('Download CA Certificate')}
        value={entity}
        onClick={onScannerCertificateDownloadClick}
      />
    }
  </IconDivider>
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
  actions,
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
      {entity.scanner_type !== CVE_SCANNER_TYPE && !entity.hasUnixSocket() &&
        entity.host}
    </TableData>
    <TableData>
      {entity.scanner_type !== CVE_SCANNER_TYPE && !entity.hasUnixSocket() &&
        entity.port}
    </TableData>
    <TableData>
      {scanner_type_name(entity.scanner_type)}
    </TableData>
    <TableData>
      {is_defined(entity.credential) &&
        <EntityLink entity={entity.credential}/>
      }
    </TableData>
    {render_component(actions, {...props, entity})}
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
