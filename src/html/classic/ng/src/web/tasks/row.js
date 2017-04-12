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

import _, {datetime} from '../../locale.js';
import {is_defined, is_empty} from '../../utils.js';

import Comment from '../comment.js';
import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import Link from '../link.js';
import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import StatusBar from '../statusbar.js';
import {render_component} from '../render.js';

import {withEntityRow} from '../entities/row.js';

import ObserverIcon from '../entities/icons/entityobservericon.js';

import Icon from '../icons/icon.js';

import TableRow from '../table/row.js';
import TableData from '../table/data.js';

import Actions from './actions.js';
import Trend from './trend.js';

import {SLAVE_SCANNER_TYPE} from '../../gmp/models/scanner.js';

const task_status = task => {
  return task.isContainer() ? 'Container' : task.status;
};

const render_report = (report, links) => {
  if (!is_defined(report)) {
    return null;
  }
  let date = datetime(report.timestamp);
  if (links) {
    return (
      <LegacyLink
        cmd="get_report"
        report_id={report.id}>
        {date}
      </LegacyLink>
    );
  }
  return date;
};

const render_status = (entity, links) => {
  let report_id;
  if (is_defined(entity.current_report)) {
    report_id = entity.current_report.id;
  }
  else if (is_defined(entity.last_report)) {
    report_id = entity.last_report.id;
  }
  else {
    links = false;
  }

  let statusbar = (
    <StatusBar
      status={task_status(entity)}
      progress={entity.progress}/>
  );

  if (links) {
    return (
      <LegacyLink
        cmd="get_report"
        report_id={report_id}
        result_hosts_only="1"
        notes="1">
        {statusbar}
      </LegacyLink>
    );
  }
  return statusbar;
};

const render_report_total = (entity, links) => {
  if (entity.report_count.total <= 0) {
    return null;
  }
  if (links) {
    return (
      <span>
        <Link to={'reports?replace_task_id=1&' +
          'filter=task_id=' + entity.id + ' and status=Done ' +
          'sort-reverse=date&filt_id=-2'}
          title={_('View list of all finished reports for Task {{name}}',
            {name: entity.name})}>
          {entity.report_count.finished}
        </Link>
        (<Link to={'reports?replace_task_id=1&' +
          'filter=task_id=' + entity.id + ' sort-reverse=date&filt_id=-2'}
          title={_('View list of all reports for Task {{name}},' +
            ' including unfinished ones', {name: entity.name})}>
          {entity.report_count.total}
        </Link>)
      </span>
    );
  }
  return (
    <span>
      {entity.report_count.finished} ({entity.report_count.total})
    </span>
  );
};

const Row = ({
    entity,
    links = true,
    actions,
    ...props,
  }, {username}) => {
  return (
    <TableRow>
      <TableData>
        <Layout flex align="space-between">
          {links ?
            <LegacyLink
              cmd="get_task"
              task_id={entity.id}>
              {entity.name}
            </LegacyLink> :
            entity.name
          }

          {entity.alterable === 1 &&
            <Icon
              size="small"
              img="alterable.svg"
              title={_('Task is alterable')}/>
          }
          {entity.scanner.type === SLAVE_SCANNER_TYPE &&
            <Icon
              size="small"
              img="sensor.svg"
              title={_('Task is configured to run on slave scanner {{name}}',
                {name: entity.scanner.name})}/>
          }
          <ObserverIcon
            displayName={_('Task')}
            entity={entity}
            userName={username}
          />
          {!is_empty(entity.observers) &&
            <Icon
              size="small"
              img="provide_view.svg"
              title={_('Task made visible for: {{user}}',
                {user: entity.observers})}/> // TODO observer roles and groups
          }
        </Layout>
        {entity.comment &&
          <Comment>({entity.comment})</Comment>
        }
      </TableData>
      <TableData flex align="center">
        {render_status(entity, links)}
      </TableData>
      <TableData>
        {render_report_total(entity, links)}
      </TableData>
      <TableData>
        {render_report(entity.last_report, links)}
      </TableData>
      <TableData flex align="center">
        {entity.last_report &&
          <SeverityBar severity={entity.last_report.severity}/>
        }
      </TableData>
      <TableData flex align="center">
        <Trend name={entity.trend}/>
      </TableData>
      {render_component(actions, {links, ...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

Row.contextTypes = {
  username: PropTypes.string.isRequired,
};

export default withEntityRow(Row, Actions);

// vim: set ts=2 sw=2 tw=80:
