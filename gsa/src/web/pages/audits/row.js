/* Copyright (C) 2019 Greenbone Networks GmbH
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

import Comment from 'web/components/comment/comment';

import AlterableIcon from 'web/components/icon/alterableicon';
import ProvideViewIcon from 'web/components/icon/provideviewicon';
import SensorIcon from 'web/components/icon/sensoricon';

import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

import Actions from './actions';
import AuditStatus from 'web/pages/tasks/status';

import {GMP_SCANNER_TYPE} from 'gmp/models/scanner';

import ComplianceStatusBar from 'web/components/bar/compliancestatusbar';

import {renderReport} from 'web/pages/tasks/row';

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
              <AlterableIcon size="small" title={_('Audit is alterable')} />
            )}
            {isDefined(scanner) && scanner.scannerType === GMP_SCANNER_TYPE && (
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
            {isDefined(observers) && observers.length > 0 && (
              <ProvideViewIcon
                size="small"
                title={_('Audit made visible for: {{observers}}', {
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
        <AuditStatus task={entity} links={links} />
      </TableData>
      <TableData>{renderReport(entity.last_report, links)}</TableData>
      <TableData>
        {isDefined(entity.last_report) && (
          <ComplianceStatusBar
            complianceStatus={getComplianceStatus(entity.last_report)}
          />
        )}
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
