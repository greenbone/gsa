/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {duration} from 'gmp/models/date';
import type ScanConfig from 'gmp/models/scanconfig';
import {scannerTypeName} from 'gmp/models/scanner';
import type Schedule from 'gmp/models/schedule';
import type Task from 'gmp/models/task';
import {YES_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import HorizontalSep from 'web/components/layout/HorizontalSep';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import DetailsTable from 'web/components/table/DetailsTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/Block';
import useGmp from 'web/hooks/useGmp';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntity as loadScanConfig,
  selector as scanConfigSelector,
} from 'web/store/entities/scanconfigs';
import {
  loadEntity as loadSchedule,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';
import {renderYesNo} from 'web/utils/Render';

interface WithName {
  name?: string;
}

interface TaskDetailsProps {
  entity: Task;
  links?: boolean;
}

export const compareAlerts = (alertA: WithName, alertB: WithName) => {
  const nameA = alertA.name?.toLowerCase() ?? '';
  const nameB = alertB.name?.toLowerCase() ?? '';
  if (nameA > nameB) {
    return 1;
  }
  if (nameA < nameB) {
    return -1;
  }
  return 0;
};

const TaskDetails = ({entity, links = true}: TaskDetailsProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();

  const scanConfig = useShallowEqualSelector<unknown, ScanConfig | undefined>(
    state => scanConfigSelector(state).getEntity(entity.config?.id),
  );
  const schedule = useShallowEqualSelector<unknown, Schedule | undefined>(
    state => scheduleSelector(state).getEntity(entity.schedule?.id),
  );
  const fetchScanConfig = useCallback(
    // @ts-expect-error
    (id: string) => dispatch(loadScanConfig(gmp)(id)),
    [dispatch, gmp],
  );

  const fetchSchedule = useCallback(
    // @ts-expect-error
    (id: string) => dispatch(loadSchedule(gmp)(id)),
    [dispatch, gmp],
  );

  useEffect(() => {
    if (isDefined(entity.config?.id)) {
      fetchScanConfig(entity.config.id);
    }
    if (isDefined(entity.schedule?.id)) {
      fetchSchedule(entity.schedule.id);
    }
  }, [entity.config, entity.schedule, fetchScanConfig, fetchSchedule]);

  const {
    alerts,
    apply_overrides: applyOverrides,
    auto_delete: autoDelete,
    auto_delete_data: autoDeleteData,
    average_duration: averageDuration,
    config,
    hosts_ordering: hostsOrdering,
    in_assets: inAssets,
    last_report: lastReport,
    min_qod: minQod,
    scanner,
    schedule_periods: schedulePeriods = -1,
    target,
    max_checks: maxChecks,
    max_hosts: maxHosts,
  } = entity;

  const {scan_end: scanEnd, scan_start: scanStart} = lastReport ?? {};

  let dur: string | undefined;
  const hasDuration = isDefined(scanStart);
  if (hasDuration) {
    if (isDefined(scanEnd)) {
      const diff = scanEnd.diff(scanStart);
      dur = duration(diff).humanize();
    } else {
      dur = _('Not finished yet');
    }
  } else {
    dur = _('No scans yet');
  }

  const hasAvDuration =
    isDefined(averageDuration) && averageDuration.asSeconds() > 0;
  const avDuration = hasAvDuration ? averageDuration.humanize() : '';

  return (
    <Layout flex="column" grow="1">
      {isDefined(target?.id) && (
        <DetailsBlock title={_('Target')}>
          <DetailsLink id={target.id} textOnly={!links} type="target">
            {target.name}
          </DetailsLink>
        </DetailsBlock>
      )}

      {isDefined(alerts) && alerts.length > 0 && (
        <DetailsBlock title={_('Alerts')}>
          <HorizontalSep>
            {alerts.sort(compareAlerts).map(alert => (
              <span key={alert.id}>
                <DetailsLink
                  id={alert.id as string}
                  textOnly={!links}
                  type="alert"
                >
                  {alert.name}
                </DetailsLink>
              </span>
            ))}
          </HorizontalSep>
        </DetailsBlock>
      )}

      {isDefined(scanner?.id) && (
        <DetailsBlock title={_('Scanner')}>
          <DetailsTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Name')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      id={scanner.id}
                      textOnly={!links}
                      type="scanner"
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
              {isDefined(config?.id) && (
                <TableRow>
                  <TableData>{_('Scan Config')}</TableData>
                  <TableData>
                    <span>
                      <DetailsLink
                        id={config.id}
                        textOnly={!links}
                        type="scanconfig"
                      >
                        {config.name}
                      </DetailsLink>
                    </span>
                  </TableData>
                </TableRow>
              )}
              {isDefined(scanConfig) && (
                <TableRow>
                  <TableData>{_('Order for target hosts')}</TableData>
                  <TableData>{hostsOrdering}</TableData>
                </TableRow>
              )}
              {isDefined(scanConfig) && isDefined(maxChecks) && (
                <TableRow>
                  <TableData>
                    {_('Maximum concurrently executed NVTs per host')}
                  </TableData>
                  <TableData>{maxChecks}</TableData>
                </TableRow>
              )}
              {isDefined(scanConfig) && isDefined(maxHosts) && (
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
              <TableData>{renderYesNo(inAssets as number)}</TableData>
            </TableRow>

            {inAssets === YES_VALUE && (
              <TableRow>
                <TableData>{_('Apply Overrides')}</TableData>
                <TableData>{renderYesNo(applyOverrides as number)}</TableData>
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

      {isDefined(schedule?.id) && (
        <DetailsBlock title={_('Schedule')}>
          <DetailsTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Name')}</TableData>
                <TableData>
                  <span>
                    <DetailsLink
                      id={schedule.id}
                      textOnly={!links}
                      type="schedule"
                    >
                      {schedule.name}
                    </DetailsLink>
                  </span>
                </TableData>
              </TableRow>
              {isDefined(schedule.event) && (
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
                      {nr: autoDeleteData as number},
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

export default TaskDetails;
