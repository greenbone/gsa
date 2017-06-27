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

import _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';
import EntityLink from '../entities/link.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../components/icon/exporticon.js';
import Icon from '../components/icon/icon.js';

import LegacyLink from '../link/legacylink.js';

import TableData from '../components/table/data.js';
import TableRow from '../components/table/row.js';

import {scanner_type_name, CVE_SCANNER_TYPE} from '../../gmp/models/scanner.js';


const Actions = ({
    entity,
    onDownloadScannerInstaller,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
    onVerifyScanner,
  }) => {
  return (
    <Layout flex align={['start', 'center']}>
      <TrashIcon
        displayName={_('Scanner')}
        name="permission"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Scanner')}
        name="permission"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Scanner')}
        name="permission"
        entity={entity}
        title={_('Clone Scanner')}
        value={entity}
        mayClone={entity.type !== CVE_SCANNER_TYPE}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Scanner')}
        onClick={onEntityDownload}
      />
      <Icon img="verify.svg"
        value={entity}
        title={_('Verify Scanner')}
        onClick={onVerifyScanner}
      />
      {is_defined(entity.credential) &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_credential"
          credential_id={entity.credential.id}
          package_format="pem"
          title={_('Download Certificate')}
        >
          <Icon img="key.svg"/>
        </LegacyLink>
      }
      {is_defined(entity.ca_pub) &&
        <LegacyLink
          className="icon icon-sm"
          cmd="download_ca_pub"
          scanner_id={entity.id}
          ca_pub={entity.ca_pub}
          title={_('Download CA Certificate')}
        >
          <Icon img="key.svg"/>
        </LegacyLink>
      }
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onDownloadScannerInstaller: PropTypes.func,
  onEntityEdit: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onVerifyScanner: PropTypes.func,
};

const Row = ({
    actions,
    entity,
    links = true,
    ...props
  }, {
    capabilities,
    username,
  }) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="scanner"
        displayName={_('Scanner')}
        userName={username}/>
      <TableData>
        {entity.type !== CVE_SCANNER_TYPE && !entity.hasUnixSocket() &&
          entity.host}
      </TableData>
      <TableData>
        {entity.type !== CVE_SCANNER_TYPE && !entity.hasUnixSocket() &&
          entity.port}
      </TableData>
      <TableData>
        {scanner_type_name(entity.type)}
      </TableData>
      <TableData>
        {is_defined(entity.credential) &&
          <EntityLink entity={entity.credential} type="credential"/>
        }
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  username: PropTypes.string.isRequired,
};

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
