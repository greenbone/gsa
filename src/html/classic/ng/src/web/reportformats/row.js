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

import _, {short_date} from '../../locale.js';

import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import Comment from '../components/comment/comment.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../components/icon/exporticon.js';
import Icon from '../components/icon/icon.js';

import Layout from '../components/layout/layout.js';

import TableData from '../components/table/data.js';
import TableRow from '../components/table/row.js';

const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
    onVerifyReportFormat,
  }, {
    capabilities,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Report Format')}
        name="report_format"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Report Format')}
        name="report_format"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Report Format')}
        name="report_format"
        entity={entity}
        title={_('Clone Report Format')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Report Format')}
        onClick={onEntityDownload}
      />
      {capabilities.mayOp('verify_report_format') ?
        <Icon img="verify.svg"
          value={entity}
          title={_('Verify Report Format')}
          onClick={onVerifyReportFormat}
        /> :
        <Icon img="verify_inactive.svg"
          title={_('Permission to verify Report Format denied')}
        />
      }
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEntityEdit: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onVerifyReportFormat: PropTypes.func,
};

Actions.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
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
        type="report_format"
        displayName={_('Report Format')}
        userName={username}>
        {entity.summary &&
          <Comment>({entity.summary})</Comment>
        }
      </EntityNameTableData>
      <TableData>
        {entity.extension}
      </TableData>
      <TableData>
        {entity.content_type}
      </TableData>
      <TableData flex="column">
        <span>
          {entity.trust.value}
        </span>
        {entity.trust.time &&
          <span>({short_date(entity.trust.time)})</span>
        }
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

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  username: PropTypes.string.isRequired,
};

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
