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
import {is_defined, parse_int} from 'gmp/utils.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component, render_yesno} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import Icon from '../../components/icon/icon.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import {secinfo_type} from 'gmp/models/secinfo.js';

const Actions = ({
  entity,
  onAlertDeleteClick,
  onAlertDownloadClick,
  onAlertCloneClick,
  onAlertEditClick,
  onAlertTestClick,
}) => (
  <Layout flex align={['center', 'center']}>
    <TrashIcon
      displayName={_('Alert')}
      name="alert"
      entity={entity}
      onClick={onAlertDeleteClick}/>
    <EditIcon
      displayName={_('Alert')}
      name="alert"
      entity={entity}
      onClick={onAlertEditClick}/>
    <CloneIcon
      displayName={_('Alert')}
      name="alert"
      entity={entity}
      title={_('Clone Alert')}
      value={entity}
      onClick={onAlertCloneClick}/>
    <ExportIcon
      value={entity}
      title={_('Export Alert')}
      onClick={onAlertDownloadClick}
    />
    <Icon
      img="start.svg"
      value={entity}
      title={_('Test Alert')}
      onClick={onAlertTestClick}
    />
  </Layout>
);

Actions.propTypes = {
  entity: PropTypes.model,
  onAlertCloneClick: PropTypes.func.isRequired,
  onAlertDeleteClick: PropTypes.func.isRequired,
  onAlertDownloadClick: PropTypes.func.isRequired,
  onAlertEditClick: PropTypes.func.isRequired,
  onAlertTestClick: PropTypes.func.isRequired,
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

  return (
    <DetailsLink
      legacy
      textOnly={!caps.mayAccess('filters') || !links}
      type="filter"
      id={filter.id}>
      {filter.name}
    </DetailsLink>
  );
};

const Row = ({
    actions,
    entity,
    links = true,
    ...props
  }, {
    capabilities,
  }) => {
  return (
    <TableRow>
      <EntityNameTableData
        legacy
        entity={entity}
        link={links}
        type="alert"
        displayName={_('Alert')}
      />
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
      <TableData>
        {render_yesno(entity.active)}
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
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
