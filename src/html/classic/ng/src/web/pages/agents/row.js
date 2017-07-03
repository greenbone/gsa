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

import _, {short_date} from 'gmp/locale.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import Icon from '../../components/icon/icon.js';

import LegacyLink from '../../components/link/legacylink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const Actions = ({
    entity,
    onDownloadAgentInstaller,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
    onVerifyAgent,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Agent')}
        name="agent"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Agent')}
        name="agent"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Agent')}
        name="agent"
        entity={entity}
        title={_('Clone Agent')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Agent')}
        onClick={onEntityDownload}
      />
      <LegacyLink
        className="icon icon-sm"
        cmd="download_agent"
        agent_format="installer"
        agent_id={entity.id}
        title={_('Download Agent installer package')}
        >
        <Icon img="agent.svg"/>
      </LegacyLink>
      <Icon img="verify.svg"
        value={entity}
        title={_('Verify Agent')}
        onClick={onVerifyAgent}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onDownloadAgentInstaller: PropTypes.func,
  onEntityEdit: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onVerifyAgent: PropTypes.func,
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
        legacy
        entity={entity}
        link={links}
        type="agent"
        displayName={_('Agent')}
        userName={username}/>
      <TableData>
        {entity.trust.status} ({short_date(entity.trust.time)})
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
