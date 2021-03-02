/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';

import {hasValue, isDefined} from 'gmp/utils/identity';

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

import {RowDetailsToggle} from 'web/entities/row';

import ObserverIcon from 'web/entity/icon/observericon';

import PropTypes from 'web/utils/proptypes';
import withUserName from 'web/utils/withUserName';

import Actions from './actions';
import TaskStatus from './status';
import Trend from './trend';

export const renderReport = (report, links) => {
  if (!hasValue(report)) {
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

const renderReportTotal = (entity, links) => {
  const total = entity?.reports?.counts?.total;
  if (!hasValue(total) || total <= 0) {
    return null;
  }
  return (
    <Layout>
      <Link
        data-testid="reports-total-link"
        to={'reports'}
        filter={'task_id=' + entity.id + ' sort-reverse=date'}
        title={_(
          'View list of all reports for Task {{name}},' +
            ' including unfinished ones',
          {name: entity.name},
        )}
        textOnly={!links || total === 0}
      >
        {total}
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
  const {scanner, observers, reports} = entity;
  const {lastReport} = reports;
  const obs = [];

  if (hasValue(observers)) {
    if (hasValue(observers.users)) {
      obs.user = _('Users {{user}}', {user: observers.users.join(', ')});
    }
    if (isDefined(observers?.roles?.length) && observers.roles.length > 0) {
      const role = observers.roles.map(r => r.name);
      obs.role = _('Roles {{role}}', {role: role.join(', ')});
    }
    if (isDefined(observers?.roles?.length) && observers.roles.length > 0) {
      const group = observers.groups.map(g => g.name);
      obs.group = _('Groups {{group}}', {group: group.join(', ')});
    }
  }

  return (
    <TableRow>
      <TableData data-testid="task-details">
        <Layout align="space-between">
          <RowDetailsToggle
            name={entity.id}
            onClick={onToggleDetailsClick}
            data-testid="task-details-toggle"
          >
            {entity.name}
          </RowDetailsToggle>
          <IconDivider>
            {entity.alterable === 1 && (
              <AlterableIcon size="small" title={_('Task is alterable')} />
            )}
            {isDefined(scanner) &&
              scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE && (
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
            {Object.keys(obs).length > 0 && (
              <ProvideViewIcon
                size="small"
                title={_(
                  'Task made visible for:\n{{user}}\n{{role}}\n{{group}}',
                  {
                    user: obs.user,
                    role: obs.role,
                    group: obs.group,
                  },
                )}
              />
            )}
          </IconDivider>
        </Layout>
        {entity.comment && <Comment>({entity.comment})</Comment>}
      </TableData>
      <TableData data-testid="task-status">
        <TaskStatus task={entity} links={links} />
      </TableData>
      <TableData data-testid="reports-total">
        {renderReportTotal(entity, links)}
      </TableData>
      <TableData data-testid="last-report">
        {renderReport(lastReport, links)}
      </TableData>
      <TableData data-testid="severity-bar">
        {!entity.isContainer() && hasValue(lastReport) && (
          <SeverityBar severity={lastReport.severity} />
        )}
      </TableData>
      <TableData align="center" data-testid="trend">
        {!entity.isContainer() && <Trend name={entity.trend} />}
      </TableData>
      <ActionsComponent
        {...props}
        links={links}
        entity={entity}
        data-testid="task-actions"
      />
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
