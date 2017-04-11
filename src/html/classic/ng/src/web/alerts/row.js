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
import {is_defined, parse_int} from '../../utils.js';

import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../icons/exporticon.js';
import Icon from '../icons/icon.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';

import {secinfo_type} from '../../gmp/models/secinfo.js';

const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
    onTestAlert,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Alert')}
        name="alert"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Alert')}
        name="alert"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Alert')}
        name="alert"
        entity={entity}
        title={_('Clone Alert')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Alert')}
        onClick={onEntityDownload}
      />
      <Icon img="start.svg"
        value={entity}
        title={_('Test Alert')}
        onClick={onTestAlert}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEntityEdit: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onTestAlert: PropTypes.func,
};

const render_event = event => {
  if (event.type === 'New SecInfo arrived') {
    let type = secinfo_type(event.data.secinfo_type.value, _('SecInfo'));
    return _('New {{secinfo_type}} arrived', {secinfo_type: type});
  }

  if (event.type === 'Updated SecInfo arrived') {
    let type = secinfo_type(event.data.secinfo_type.value, _('SecInfo'));
    return _('New {{secinfo_type}} arrived', {secinfo_type: type});
  }

  if (event.type === 'Task run status changed' &&
    is_defined(event.data.status)) {
    return _('Task run status changed to {{status}}',
      {status: event.data.status.value});
  }
  return event.type;
};

const render_method = method => {
  let url = '';
  if (method.type === 'SCP') {
    let scp_credential = method.data.scp_credential;

    if (is_defined(scp_credential) && is_defined(scp_credential.credential)) {
      url += scp_credential.credential.login;
    }
    else {
      url += _('(Credential unavailable)');
    }

    url += '@';

    if (is_defined(method.data.scp_host)) {
      url += method.data.scp_host.value;
    }
    if (is_defined(method.data.scp_path)) {
      url += ':' + method.data.scp_path.value;
    }
    return _('SCP to {{url}}', {url});
  }

  if (method.type === 'Send') {
    url += method.data.send_host.value + ':' + method.data.send_port.value;
    return _('SCP to {{url}}', {url});
  }

  if (method.type === 'Syslog' && method.data.submethod.value === 'SNMP') {
    return 'SNMP';
  }

  if (method.type === 'SNMP') {
    return _('SNMP to {{agent}}', {agent: method.data.snmp_agent.value});
  }

  if (method.type === 'Email' && is_defined(method.data.to_address)) {
    return _('Email to {{address}}', {address: method.data.to_address.value});
  }

  if (method.type === 'Start Task') {
    // FIXME task name ist missing
    // in xslt the tasks have been added to the response
    // we should improve the backend to return the name for the task id here too
    return _('Start Task');
  }

  return method.type;
};

const render_condition = (condition, event) => {
  if (condition.type === 'Filter count at least') {
    let count = parse_int(condition.data.count.value);
    let type;

    // FIXME this is not translateable
    if (event.type === 'New SecInfo arrived' ||
      event.type === 'Updated SecInfo arrived') {
      type = 'NVT';
    }
    else {
      type = 'result';
    }

    if (count > 1) {
      type += 's';
    }
    return _('Filter matches at least {{count}} {{type}}',
      {count, type});
  }

  if (condition.type === 'Filter count changed') {
    let count = parse_int(condition.data.count.value);
    let direction = condition.data.direction.value === 'decreased' ?
      'fewer' : 'more';

    // FIXME this is not translateable
    return _('Filter matches at least {{count}} {{direction}} {{result}} ' +
      'then the previous scan', {
        count,
        direction,
        result: count > 0 ? 'results' : 'result',
      });
  }

  if (condition.type === 'Severity at least' &&
    is_defined(condition.data.severity)) {
    return _('Severity at least {{severity}}',
      {severity: condition.data.severity.value});
  }

  if (condition.type === 'Severity changed') {
    if (is_defined(condition.data.direction)) {
      if (condition.data.direction.value === 'decreased') {
        return _('Severity level decreased');
      }
      return _('Severity level increased');
    }
    return _('Severity level changed');
  }
  return condition.type;
};

const render_filter = (filter, caps, links = true) => {
  if (!is_defined(filter)) {
    return null;
  }

  if (caps.mayAccess('filters') && links) {
    return (
      <LegacyLink
        cmd="get_filter"
        filter_id={filter.id}>
        {filter.name}
      </LegacyLink>
    );
  }

  return filter.name;
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
        type="alert"
        displayName={_('Alert')}
        userName={username}/>
      <TableData>
        {render_event(entity.event)}
      </TableData>
      <TableData>
        {render_condition(entity.condition, entity.event)}
      </TableData>
      <TableData>
        {render_method(entity.method)}
      </TableData>
      <TableData>
        {render_filter(entity.filter, capabilities)}
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
