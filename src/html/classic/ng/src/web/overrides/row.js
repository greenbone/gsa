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
import {shorten, is_defined} from '../../utils.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import {render_component, result_cvss_risk_factor} from '../render.js';

import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../components/icon/exporticon.js';

import LegacyLink from '../link/legacylink.js';

import TableRow from '../table/row.js';
import TableData from '../table/data.js';


const render_severity = severity => {
  if (is_defined(severity)) {
    if (severity <= 0) {
      return _(result_cvss_risk_factor(severity));
    }
    return '> ' + (severity - 0.1).toFixed(1);
  }
  return _('Any');
};

const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEditOverrideClick,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        entity={entity}
        name="override"
        onClick={onEntityDelete}/>
      <EditIcon
        entity={entity}
        name="override"
        onClick={onEditOverrideClick}/>
      <CloneIcon
        entity={entity}
        name="override"
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Override')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEditOverrideClick: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
};

const Row = ({entity, links = true, actions, ...props}) => {
  return (
    <TableRow>
      <TableData>
        {links ?
          <LegacyLink
            cmd="get_override"
            override_id={entity.id}>
            {shorten(entity.text)}
          </LegacyLink> :
          shorten(entity.text)
        }
      </TableData>
      <TableData>
        {entity.nvt ? entity.nvt.name : ""}
      </TableData>
      <TableData title={entity.hosts}>
        {shorten(entity.hosts)}
      </TableData>
      <TableData title={entity.port}>
        {shorten(entity.port)}
      </TableData>
      <TableData>
        {render_severity(entity.severity)}
      </TableData>
      <TableData flex align={['center', 'center']}>
        <SeverityBar severity={entity.new_severity}/>
      </TableData>
      <TableData>
        {entity.isActive() ? _('yes') : _('no')}
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

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
