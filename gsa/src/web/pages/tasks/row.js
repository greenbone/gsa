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

import {isDefined, isString} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withUserName from 'web/utils/withUserName';

import {RowDetailsToggle} from 'web/entities/row';

import ObserverIcon from 'web/entity/icon/observericon';

import SeverityBar from 'web/components/bar/severitybar';

import Comment from 'web/components/comment/comment';

import DateTime from 'web/components/date/datetime';

import AlterableIcon from 'web/components/icon/alterableicon';
import ProvideViewIcon from 'web/components/icon/provideviewicon';
import SensorIcon from 'web/components/icon/sensoricon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import Actions from './actions';
import TaskStatus from './status';
import Trend from './trend';

import {GMP_SCANNER_TYPE} from 'gmp/models/scanner';

const render_report = (report, links) => {
  if (!isDefined(report)) {
    return null;
  }
  return (
    <span>
      <DetailsLink type="report" id={report.id} textOnly={!links}>
        <DateTime date={report.timestamp} />
      </DetailsLink>
    </span>
  );
};

const render_report_total = (entity, links) => {
  if (entity.report_count.total <= 0) {
    return null;
  }
  return (
    <Layout>
      <Link
        to={'reports'}
        filter={'task_id=' + entity.id + ' sort-reverse=date'}
        title={_(
          'View list of all reports for Task {{name}},' +
            ' including unfinished ones',
          {name: entity.name},
        )}
        textOnly={!links || entity.report_count.total === 0}
      >
        {entity.report_count.total}
      </Link>
    </Layout>
  );
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  username,
  onToggleDetailsClick,
  ...props
}) => {
  const {scanner, observers} = entity;

  const obs = [];
  if (isDefined(observers)) {
    if (isString(observers)) {
      obs.push(_('User {{name}}', {name: observers}));
    } else {
      if (isDefined(observers.role)) {
        obs.push(_('Role {{name}}', {name: observers.role.name}));
      }
      if (isDefined(observers.group)) {
        obs.push(_('Group {{name}}', {name: observers.group.name}));
      }
    }
  }
  return (
    <TableRow>
      <TableData>
        <Layout align="space-between">
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
          <IconDivider>
            {entity.alterable === 1 && (
              <AlterableIcon size="small" title={_('Task is alterable')} />
            )}
            {isDefined(scanner) && scanner.type === GMP_SCANNER_TYPE && (
              <SensorIcon
                size="small"
                title={_('Task is configured to run on sensor {{name}}', {
                  name: scanner.name,
                })}
              />
            )}
            <ObserverIcon
              displayName={_('Task')}
              entity={entity}
              userName={username}
            />
            {isDefined(observers) && observers.length > 0 && (
              <ProvideViewIcon
                size="small"
                title={_('Task made visible for: {{observers}}', {
                  observers: obs.join(', '),
                })}
              />
            ) // TODO observer roles and groups
            }
          </IconDivider>
        </Layout>
        {entity.comment && <Comment>({entity.comment})</Comment>}
      </TableData>
      <TableData>
        <TaskStatus task={entity} links={links} />
      </TableData>
      <TableData>{render_report_total(entity, links)}</TableData>
      <TableData>{render_report(entity.last_report, links)}</TableData>
      <TableData>
        {!entity.isContainer() && isDefined(entity.last_report) && (
          <SeverityBar severity={entity.last_report.severity} />
        )}
      </TableData>
      <TableData align="center">
        {!entity.isContainer() && <Trend name={entity.trend} />}
      </TableData>
      <ActionsComponent {...props} links={links} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  username: PropTypes.string.isRequired,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withUserName(Row);

// vim: set ts=2 sw=2 tw=80:
