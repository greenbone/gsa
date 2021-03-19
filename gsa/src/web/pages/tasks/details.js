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
import React, {useEffect} from 'react';

import _ from 'gmp/locale';

import {duration} from 'gmp/models/date';
import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';
import {scannerTypeName} from 'gmp/models/scanner';

import {YES_VALUE} from 'gmp/parser';

import {hasValue, isDefined} from 'gmp/utils/identity';

import DateTime from 'web/components/date/datetime';

import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';

import DetailsTable from 'web/components/table/detailstable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';

import {useLazyGetSchedule} from 'web/graphql/schedules';
import {useLazyGetScanConfig} from 'web/graphql/scanconfigs';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

export const compareAlerts = (alertA, alertB) => {
  const nameA = alertA.name.toLowerCase();
  const nameB = alertB.name.toLowerCase();
  if (nameA > nameB) {
    return 1;
  }
  if (nameA < nameB) {
    return -1;
  }
  return 0;
};

const TaskDetails = ({entity, links = true}) => {
  // Loaders
  const [loadScanConfig, {scanConfig = undefined}] = useLazyGetScanConfig();

  const [loadSchedule, {schedule}] = useLazyGetSchedule(entity?.schedule?.id);

  useEffect(() => {
    if (hasValue(entity.config)) {
      loadScanConfig(entity.config.id);
    } // entity being in deps array will result in excessive rerenders
    if (hasValue(entity.schedule)) {
      loadSchedule(entity.schedule.id);
    }
  }, [loadScanConfig, loadSchedule]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    alerts,
    applyOverrides,
    autoDelete,
    autoDeleteData,
    averageDuration,
    hostsOrdering,
    inAssets,
    reports,
    minQod,
    scanner,
    target,
    maxChecks,
    maxHosts,
    sourceIface = '',
  } = entity;

  const {lastReport} = reports;

  let dur;
  const hasDuration = hasValue(lastReport) && hasValue(lastReport.scanStart);
  if (hasDuration) {
    if (hasValue(lastReport.scanEnd)) {
      const diff = lastReport.scanEnd.diff(lastReport.scanStart); // Seems like scanEnd is not a valid date object or something. I get an error sometimes.
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

      {hasValue(alerts) && alerts.length > 0 && (
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
              {hasValue(scanConfig) && (
                <TableRow>
                  <TableData>{_('Scan Config')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        textOnly={!links}
                        type="scanconfig"
                        id={scanConfig.id}
                      >
                        {scanConfig.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
              {hasValue(scanConfig) &&
                scanConfig.scanConfigType === OPENVAS_SCAN_CONFIG_TYPE &&
                hasValue(hostsOrdering) && (
                  <TableRow>
                    <TableData>{_('Order for target hosts')}</TableData>
                    <TableData>{hostsOrdering}</TableData>
                  </TableRow>
                )}
              {hasValue(scanConfig) &&
                scanConfig.scanConfigType === OPENVAS_SCAN_CONFIG_TYPE && (
                  <TableRow>
                    <TableData>{_('Network Source Interface')}</TableData>
                    <TableData>{sourceIface}</TableData>
                  </TableRow>
                )}
              {hasValue(scanConfig) &&
                scanConfig.scanConfigType === OPENVAS_SCAN_CONFIG_TYPE &&
                hasValue(maxChecks) && (
                  <TableRow>
                    <TableData>
                      {_('Maximum concurrently executed NVTs per host')}
                    </TableData>
                    <TableData>{maxChecks}</TableData>
                  </TableRow>
                )}
              {hasValue(scanConfig) &&
                scanConfig.scanConfigType === OPENVAS_SCAN_CONFIG_TYPE &&
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

            {inAssets === YES_VALUE && (
              <TableRow>
                <TableData>{_('Apply Overrides')}</TableData>
                <TableData>{renderYesNo(applyOverrides)}</TableData>
              </TableRow>
            )}

            {inAssets === YES_VALUE && (
              <TableRow>
                <TableData>{_('Min QoD')}</TableData>
                <TableData>{minQod + ' %'}</TableData>
              </TableRow>
            )}
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
                    {isDefined(schedule.event.nextDate) ? (
                      <DateTime date={schedule.event.nextDate} />
                    ) : (
                      _('N/A')
                    )}
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

TaskDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default TaskDetails;

// vim: set ts=2 sw=2 tw=80:
