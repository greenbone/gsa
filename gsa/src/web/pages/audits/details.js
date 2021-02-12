/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import React, {useEffect} from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';
import DateTime from 'web/components/date/datetime';

import {hasValue} from 'gmp/utils/identity';

import {duration} from 'gmp/models/date';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';
import {scannerTypeName} from 'gmp/models/scanner';

import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import DetailsTable from 'web/components/table/detailstable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';

import {compareAlerts} from 'web/pages/tasks/details';

import {
  loadEntity as loadScheduleAction,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';

import {
  loadEntity as loadPolicyAction,
  selector as policySelector,
} from 'web/store/entities/policies';

import PropTypes from 'web/utils/proptypes';
import compose from 'web/utils/compose';
import withGmp from 'web/utils/withGmp';
import {renderYesNo} from 'web/utils/render';

const AuditDetails = ({entity, loadPolicy, loadSchedule, ...props}) => {
  useEffect(() => {
    if (hasValue(entity.config)) {
      loadPolicy(entity.config.id);
    }
    if (hasValue(entity.schedule)) {
      loadSchedule(entity.schedule.id);
    }
  }, [entity, loadPolicy, loadSchedule]);

  const {links = true, schedule} = props;
  const {
    alerts,
    autoDelete,
    autoDeleteData,
    averageDuration,
    policy,
    hostsOrdering,
    inAssets,
    preferences,
    scanner,
    schedulePeriods,
    target,
    reports,
    maxChecks,
    maxHosts,
  } = entity;

  const {lastReport} = reports;

  const {iface = {}} = preferences;

  let dur;
  const hasDuration = hasValue(lastReport) && hasValue(lastReport.scanStart);
  if (hasDuration) {
    if (hasValue(lastReport.scanEnd)) {
      const diff = lastReport.scanEnd.diff(lastReport.scanStart);
      dur = duration(diff).humanize();
    } else {
      dur = _('Not finished yet');
    }
  } else {
    dur = _('No scans yet');
  }

  const hasAvDuration = hasValue(averageDuration) && averageDuration > 0;
  const avDuration = hasAvDuration ? averageDuration.humanize() : '';

  return (
    <Layout grow="1" flex="column">
      {hasValue(target) && (
        <DetailsBlock title={_('Target')}>
          <DetailsLink textOnly={!links} type="target" id={target.id}>
            {target.name}
          </DetailsLink>
        </DetailsBlock>
      )}

      {hasValue(alerts) && (
        <DetailsBlock title={_('Alerts')}>
          <HorizontalSep>
            {alerts.sort(compareAlerts).map(alert => (
              <span key={alert.id}>
                <DetailsLink textOnly={!links} type="alert" id={alert.id}>
                  {alert.name}
                </DetailsLink>
              </span>
            ))}
          </HorizontalSep>
        </DetailsBlock>
      )}

      {hasValue(scanner) && (
        <DetailsBlock title={_('Scanner')}>
          <DetailsTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Name')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      textOnly={!links}
                      type="scanner"
                      id={scanner.id}
                    >
                      {scanner.name}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>{_('Type')}</TableData>
                <TableData>{scannerTypeName(scanner.scannerType)}</TableData>
              </TableRow>
              {hasValue(policy) && (
                <TableRow>
                  <TableData>{_('Policy')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        textOnly={!links}
                        type="policy"
                        id={policy.id}
                      >
                        {policy.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
              {hasValue(policy) &&
                policy.policyType === OPENVAS_SCAN_CONFIG_TYPE && (
                  <TableRow>
                    <TableData>{_('Order for target hosts')}</TableData>
                    <TableData>{hostsOrdering}</TableData>
                  </TableRow>
                )}
              {hasValue(policy) &&
                policy.policyType === OPENVAS_SCAN_CONFIG_TYPE && (
                  <TableRow>
                    <TableData>{_('Network Source Interface')}</TableData>
                    <TableData>{iface.value}</TableData>
                  </TableRow>
                )}
              {hasValue(policy) &&
                policy.policyType === OPENVAS_SCAN_CONFIG_TYPE &&
                hasValue(maxChecks) && (
                  <TableRow>
                    <TableData>
                      {_('Maximum concurrently executed NVTs per host')}
                    </TableData>
                    <TableData>{maxChecks}</TableData>
                  </TableRow>
                )}
              {hasValue(policy) &&
                policy.policyType === OPENVAS_SCAN_CONFIG_TYPE &&
                hasValue(maxHosts) && (
                  <TableRow>
                    <TableData>
                      {_('Maximum concurrently scanned hosts')}
                    </TableData>
                    <TableData>{maxHosts}</TableData>
                  </TableRow>
                )}
            </TableBody>
          </DetailsTable>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('Assets')}>
        <DetailsTable>
          <TableBody>
            <TableRow>
              <TableData>{_('Add to Assets')}</TableData>
              <TableData>{renderYesNo(inAssets)}</TableData>
            </TableRow>
          </TableBody>
        </DetailsTable>
      </DetailsBlock>

      {hasValue(schedule) && (
        <DetailsBlock title={_('Schedule')}>
          <DetailsTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Name')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      textOnly={!links}
                      type="schedule"
                      id={schedule.id}
                    >
                      {schedule.name}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
              {hasValue(schedule.event) && (
                <TableRow>
                  <TableData>{_('Next')}</TableData>
                  <TableData>
                    <DateTime date={schedule.event.nextDate} />
                  </TableData>
                </TableRow>
              )}
            </TableBody>
          </DetailsTable>
        </DetailsBlock>
      )}

      <DetailsBlock title={_('Scan')}>
        <DetailsTable>
          <TableBody>
            <TableRow>
              <TableData>{_('Duration of last Scan')}</TableData>
              <TableData>{dur}</TableData>
            </TableRow>
            {hasAvDuration && (
              <TableRow>
                <TableData>{_('Average Scan duration')}</TableData>
                <TableData>{avDuration}</TableData>
              </TableRow>
            )}
            {schedulePeriods > 0 && (
              <TableRow>
                <TableData>{_('Period')}</TableData>
                <TableData>
                  {schedulePeriods > 1
                    ? _('{{nr}} more times', {nr: schedulePeriods})
                    : _('Once')}
                </TableData>
              </TableRow>
            )}
            <TableRow>
              <TableData>{_('Auto delete Reports')}</TableData>
              <TableData>
                {autoDelete === 'keep'
                  ? _(
                      'Automatically delete oldest reports but always keep ' +
                        'newest {{nr}} reports',
                      {nr: autoDeleteData},
                    )
                  : _('Do not automatically delete reports')}
              </TableData>
            </TableRow>
          </TableBody>
        </DetailsTable>
      </DetailsBlock>
    </Layout>
  );
};

AuditDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  gmp: PropTypes.gmp.isRequired,
  links: PropTypes.bool,
  loadPolicy: PropTypes.func.isRequired,
  loadSchedule: PropTypes.func.isRequired,
  policy: PropTypes.model,
  schedule: PropTypes.model,
};

const mapStateToProps = (rootState, {entity = {}}) => {
  const scheduleSel = scheduleSelector(rootState);
  const policySel = policySelector(rootState);
  return {
    policy: hasValue(entity.config)
      ? policySel.getEntity(entity.config.id)
      : undefined,
    schedule: hasValue(entity.schedule)
      ? scheduleSel.getEntity(entity.schedule.id)
      : undefined,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadPolicy: id => dispatch(loadPolicyAction(gmp)(id)),
  loadSchedule: id => dispatch(loadScheduleAction(gmp)(id)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(AuditDetails);

// vim: set ts=2 sw=2 tw=80:
