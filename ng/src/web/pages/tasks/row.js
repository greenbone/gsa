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

import _, {datetime} from 'gmp/locale.js';
import {is_defined, is_empty} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';
import withUserName from '../../utils/withUserName.js';

import {withEntityRow, RowDetailsToggle} from '../../entities/row.js';

import ObserverIcon from '../../entity/icon/observericon.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Comment from '../../components/comment/comment.js';

import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import TableRow from '../../components/table/row.js';
import TableData from '../../components/table/data.js';

import Actions from './actions.js';
import TaskStatus from './status.js';
import Trend from './trend.js';

import {SLAVE_SCANNER_TYPE} from 'gmp/models/scanner.js';

const render_report = (report, links) => {
  if (!is_defined(report)) {
    return null;
  }
  const date = datetime(report.timestamp);
  return (
    <DetailsLink
      type="report"
      id={report.id}
      textOnly={!links}
    >
      {date}
    </DetailsLink>
  );
};

const render_report_total = (entity, links) => {
  if (entity.report_count.total <= 0) {
    return null;
  }
  return (
    <Layout flex align={['center', 'center']}>
      <Link
        to={'reports'}
        filter={'task_id=' + entity.id + ' and status=Done ' +
          'sort-reverse=date&filt_id=-2'}
        title={_('View list of all finished reports for Task {{name}}',
          {name: entity.name})}
        textOnly={!links || entity.report_count.finished === 0}
      >
        {entity.report_count.finished}
      </Link>
      <span>&nbsp;</span>
      (
      <Link
        to={'reports'}
        filter={'task_id=' + entity.id + ' sort-reverse=date&filt_id=-2'}
        title={_('View list of all reports for Task {{name}},' +
                 ' including unfinished ones', {name: entity.name})}
        textOnly={!links || entity.report_count.total === 0}
      >
        {entity.report_count.total}
      </Link>
      )
    </Layout>
  );
};

const Row = ({
  entity,
  links = true,
  actions,
  userName,
  onToggleDetailsClick,
  ...props
}) => {
  const {scanner} = entity;
  return (
    <TableRow>
      <TableData>
        <Layout flex align="space-between">
          <RowDetailsToggle
            name={entity.id}
            onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
          <IconDivider>
            {entity.alterable === 1 &&
              <Icon
                size="small"
                img="alterable.svg"
                title={_('Task is alterable')}/>
            }
            {is_defined(scanner) && scanner.type === SLAVE_SCANNER_TYPE &&
              <Icon
                size="small"
                img="sensor.svg"
                title={_('Task is configured to run on slave scanner {{name}}',
                  {name: scanner.name})}/>
            }
            <ObserverIcon
              displayName={_('Task')}
              entity={entity}
              userName={userName}
            />
            {!is_empty(entity.observers) &&
              <Icon
                size="small"
                img="provide_view.svg"
                title={_('Task made visible for: {{user}}',
                  {user: entity.observers})}/> // TODO observer roles and groups
            }
          </IconDivider>
        </Layout>
        {entity.comment &&
          <Comment>({entity.comment})</Comment>
        }
      </TableData>
      <TableData flex align="center">
        <TaskStatus task={entity} links={links}/>
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
      {render_component(actions, {
        links,
        ...props,
        entity,
      })}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  userName: PropTypes.string.isRequired,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(Actions)(withUserName(Row));

// vim: set ts=2 sw=2 tw=80:
