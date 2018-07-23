/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';
import {renderComponent} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const Actions = ({
  entity,
  onAgentDeleteClick,
  onAgentDownloadClick,
  onAgentCloneClick,
  onAgentInstallerDownloadClick,
  onAgentEditClick,
  onAgentVerifyClick,
}) => (
  <IconDivider
    grow
    align={['center', 'center']}
  >
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
    <Icon
      img="agent.svg"
      value={entity}
      title={_('Download Agent Installer Package')}
      onClick={onAgentInstallerDownloadClick}
    />
    <Icon
      img="verify.svg"
      value={entity}
      title={_('Verify Agent')}
      onClick={onAgentVerifyClick}
    />
  </IconDivider>
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
  actions,
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
    {renderComponent(actions, {...props, entity})}
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
