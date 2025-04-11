/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import ComplianceStatusBar from 'web/components/bar/ComplianceStatusBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import { AlterableIcon,ProvideViewIcon,SensorIcon } from 'web/components/icon/icons';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/Data';
import TableRow from 'web/components/table/Row';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import ObserverIcon from 'web/entity/icon/ObserverIcon';
import useUserName from 'web/hooks/useUserName';
import Actions from 'web/pages/audits/Actions';
import AuditStatus from 'web/pages/tasks/Status';
import PropTypes from 'web/utils/PropTypes';
const renderAuditReport = (report, links) => {
  if (!isDefined(report)) {
    return null;
  }
  return (
    <span>
      <DetailsLink id={report.id} textOnly={!links} type="auditreport">
        <DateTime date={report.timestamp} />
      </DetailsLink>
    </span>
  );
};

const getComplianceStatus = report => {
  if (!isDefined(report)) {
    return -1;
  }

  const complianceResultsTotal = isDefined(report.compliance_count)
    ? parseInt(report.compliance_count.yes) +
      parseInt(report.compliance_count.no) +
      parseInt(report.compliance_count.incomplete)
    : 0;

  const complianceStatus =
    complianceResultsTotal === 0
      ? -1 // if there are no results at all there must have been an error
      : parseInt(
          (parseInt(report.compliance_count.yes) / complianceResultsTotal) *
            100,
        );

  return complianceStatus;
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const [username] = useUserName();
  const {scanner, observers} = entity;
  const obs = [];

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
        <Layout align="space-between">
          <RowDetailsToggle name={entity.id} onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
          <IconDivider>
            {entity.alterable === 1 && (
              <AlterableIcon size="small" title={_('Audit is alterable')} />
            )}
            {isDefined(scanner) &&
              scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE && (
                <SensorIcon
                  size="small"
                  title={_('Audit is configured to run on sensor {{name}}', {
                    name: scanner.name,
                  })}
                />
              )}
            <ObserverIcon
              displayName={_('Audit')}
              entity={entity}
              userName={username}
            />
            {isDefined(observers) && Object.keys(observers).length > 0 && (
              <ProvideViewIcon
                size="small"
                title={_(
                  'Audit made visible for:\n{{user}}\n{{role}}\n{{group}}',
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
      <TableData>
        <AuditStatus isAudit={true} links={links} task={entity} />
      </TableData>
      <TableData>{renderAuditReport(entity.last_report, links)}</TableData>
      <TableData>
        {isDefined(entity.last_report) && (
          <ComplianceStatusBar
            complianceStatus={getComplianceStatus(entity.last_report)}
          />
        )}
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
