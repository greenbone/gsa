/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

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

import AgentIcon from 'web/components/icon/agenticon';

import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({
    entity,
    onAgentDeleteClick,
    onAgentDownloadClick,
    onAgentCloneClick,
    onAgentInstallerDownloadClick,
    onAgentEditClick,
    onAgentVerifyClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
      <TrashIcon
        displayName={_('Agent')}
        name="agent"
        entity={entity}
        onClick={onAgentDeleteClick}
      />
      <EditIcon
        displayName={_('Agent')}
        name="agent"
        entity={entity}
        onClick={onAgentEditClick}
      />
      <CloneIcon
        displayName={_('Agent')}
        name="agent"
        entity={entity}
        title={_('Clone Agent')}
        value={entity}
        onClick={onAgentCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Agent')}
        onClick={onAgentDownloadClick}
      />
      <AgentIcon
        value={entity}
        title={_('Download Agent Installer Package')}
        onClick={onAgentInstallerDownloadClick}
      />
      <VerifyIcon
        value={entity}
        title={_('Verify Agent')}
        onClick={onAgentVerifyClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onAgentCloneClick: PropTypes.func.isRequired,
  onAgentDeleteClick: PropTypes.func.isRequired,
  onAgentDownloadClick: PropTypes.func.isRequired,
  onAgentEditClick: PropTypes.func.isRequired,
  onAgentInstallerDownloadClick: PropTypes.func.isRequired,
  onAgentVerifyClick: PropTypes.func.isRequired,
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
      links={links}
      type="agent"
      displayName={_('Agent')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>
      {entity.trust.status} ({shortDate(entity.trust.time)})
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
