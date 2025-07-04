/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import {AlterableIcon, ProvideViewIcon, SensorIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/TableRow';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import ObserverIcon from 'web/entity/icon/ObserverIcon';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';
import Actions from 'web/pages/tasks/Actions';
import TaskStatus from 'web/pages/tasks/Status';
import Trend from 'web/pages/tasks/Trend';
import PropTypes from 'web/utils/PropTypes';

export const renderReport = (report, links) => {
  if (!isDefined(report)) {
    return null;
  }
  return (
    <span>
      <DetailsLink id={report.id} textOnly={!links} type="report">
        <DateTime date={report.timestamp} />
      </DetailsLink>
    </span>
  );
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const [_] = useTranslation();
  const [username] = useUserName();
  const {scanner, observers} = entity;

  const obs = [];

  const renderReportTotal = (entity, links) => {
    if (entity.report_count.total <= 0) {
      return null;
    }
    return (
      <Layout>
        <Link
          filter={'task_id=' + entity.id + ' sort-reverse=date'}
          textOnly={!links || entity.report_count.total === 0}
          title={_(
            'View list of all reports for Task {{name}},' +
              ' including unfinished ones',
            {name: entity.name},
          )}
          to={'reports'}
        >
          {entity.report_count.total}
        </Link>
      </Layout>
    );
  };

  if (isDefined(observers)) {
    if (isDefined(observers.user)) {
      obs.user = _('Users {{user}}', {user: observers.user.join(', ')});
    }
    if (isDefined(observers.role)) {
      const role = observers.role.map(r => r.name);
      obs.role = _('Roles {{role}}', {role: role.join(', ')});
    }
    if (isDefined(observers.group)) {
      const group = observers.group.map(g => g.name);
      obs.group = _('Groups {{group}}', {group: group.join(', ')});
    }
  }

  return (
    <TableRow>
      <TableData>
        <Layout align={'space-between'} columns={2}>
          <div>
            <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
              {entity.name}
            </RowDetailsToggle>
            {entity.comment && <Comment>({entity.comment})</Comment>}
          </div>
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
            {isDefined(observers) && Object.keys(observers).length > 0 && (
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
      </TableData>
      <TableData>
        <TaskStatus links={links} task={entity} />
      </TableData>
      <TableData>{renderReportTotal(entity, links)}</TableData>
      <TableData>{renderReport(entity.last_report, links)}</TableData>
      <TableData>
        {!entity.isContainer() && isDefined(entity.last_report) && (
          <SeverityBar severity={entity.last_report.severity} />
        )}
      </TableData>
      <TableData align="center">
        {!entity.isContainer() && <Trend name={entity.trend} />}
      </TableData>
      <ActionsComponent {...props} entity={entity} links={links} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;
