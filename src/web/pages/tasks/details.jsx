/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {duration} from 'gmp/models/date';
import {scannerTypeName} from 'gmp/models/scanner';
import {YES_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import DateTime from 'web/components/date/datetime';
import HorizontalSep from 'web/components/layout/horizontalsep';
import Layout from 'web/components/layout/layout';
import DetailsLink from 'web/components/link/detailslink';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import DetailsTable from 'web/components/table/detailstable';
import TableRow from 'web/components/table/row';
import DetailsBlock from 'web/entity/block';
import {
  loadEntity as loadScanConfig,
  selector as scanConfigSelector,
} from 'web/store/entities/scanconfigs';
import {
  loadEntity as loadSchedule,
  selector as scheduleSelector,
} from 'web/store/entities/schedules';
import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

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

class TaskDetails extends React.Component {
  componentDidMount() {
    const {entity} = this.props;

    if (isDefined(entity.config)) {
      this.props.loadScanConfig(entity.config.id);
    }
    if (isDefined(entity.schedule)) {
      this.props.loadSchedule(entity.schedule.id);
    }
  }

  render() {
    const {links = true, entity, scanConfig, schedule} = this.props;
    const {
      alerts,
      apply_overrides,
      auto_delete,
      auto_delete_data,
      average_duration,
      config,
      hosts_ordering,
      in_assets,
      last_report,
      min_qod,
      scanner,
      schedule_periods,
      target,
      max_checks,
      max_hosts,
    } = entity;

    let dur;
    const has_duration =
      isDefined(last_report) && isDefined(last_report.scan_start);
    if (has_duration) {
      if (isDefined(last_report.scan_end)) {
        const diff = last_report.scan_end.diff(last_report.scan_start);
        dur = duration(diff).humanize();
      } else {
        dur = _('Not finished yet');
      }
    } else {
      dur = _('No scans yet');
    }

    const has_av_duration = isDefined(average_duration) && average_duration > 0;
    const av_duration = has_av_duration ? average_duration.humanize() : '';

    return (
      <Layout flex="column" grow="1">
        {isDefined(target) && (
          <DetailsBlock title={_('Target')}>
            <DetailsLink id={target.id} textOnly={!links} type="target">
              {target.name}
            </DetailsLink>
          </DetailsBlock>
        )}

        {isDefined(alerts) && (
          <DetailsBlock title={_('Alerts')}>
            <HorizontalSep>
              {alerts.sort(compareAlerts).map(alert => (
                <span key={alert.id}>
                  <DetailsLink id={alert.id} textOnly={!links} type="alert">
                    {alert.name}
                  </DetailsLink>
                </span>
              ))}
            </HorizontalSep>
          </DetailsBlock>
        )}

        {isDefined(scanner) && (
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
                {isDefined(config) && (
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
                    <TableData>{hosts_ordering}</TableData>
                  </TableRow>
                )}
                {isDefined(scanConfig) && isDefined(max_checks) && (
                  <TableRow>
                    <TableData>
                      {_('Maximum concurrently executed NVTs per host')}
                    </TableData>
                    <TableData>{max_checks}</TableData>
                  </TableRow>
                )}
                {isDefined(scanConfig) && isDefined(max_hosts) && (
                  <TableRow>
                    <TableData>
                      {_('Maximum concurrently scanned hosts')}
                    </TableData>
                    <TableData>{max_hosts}</TableData>
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
                <TableData>{renderYesNo(in_assets)}</TableData>
              </TableRow>

              {in_assets === YES_VALUE && (
                <TableRow>
                  <TableData>{_('Apply Overrides')}</TableData>
                  <TableData>{renderYesNo(apply_overrides)}</TableData>
                </TableRow>
              )}

              {in_assets === YES_VALUE && (
                <TableRow>
                  <TableData>{_('Min QoD')}</TableData>
                  <TableData>{min_qod + ' %'}</TableData>
                </TableRow>
              )}
            </TableBody>
          </DetailsTable>
        </DetailsBlock>

        {isDefined(schedule) && (
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
              {has_av_duration && (
                <TableRow>
                  <TableData>{_('Average Scan duration')}</TableData>
                  <TableData>{av_duration}</TableData>
                </TableRow>
              )}
              {schedule_periods > 0 && (
                <TableRow>
                  <TableData>{_('Period')}</TableData>
                  <TableData>
                    {schedule_periods > 1
                      ? _('{{nr}} more times', {nr: schedule_periods})
                      : _('Once')}
                  </TableData>
                </TableRow>
              )}
              <TableRow>
                <TableData>{_('Auto delete Reports')}</TableData>
                <TableData>
                  {auto_delete === 'keep'
                    ? _(
                        'Automatically delete oldest reports but always keep ' +
                          'newest {{nr}} reports',
                        {nr: auto_delete_data},
                      )
                    : _('Do not automatically delete reports')}
                </TableData>
              </TableRow>
            </TableBody>
          </DetailsTable>
        </DetailsBlock>
      </Layout>
    );
  }
}

TaskDetails.propTypes = {
  entity: PropTypes.model.isRequired,
  gmp: PropTypes.gmp.isRequired,
  links: PropTypes.bool,
  loadScanConfig: PropTypes.func.isRequired,
  loadSchedule: PropTypes.func.isRequired,
  scanConfig: PropTypes.model,
  schedule: PropTypes.model,
};

const mapStateToProps = (rootState, {entity = {}}) => {
  const scheduleSel = scheduleSelector(rootState);
  const scanConfigSel = scanConfigSelector(rootState);
  return {
    scanConfig: isDefined(entity.config)
      ? scanConfigSel.getEntity(entity.config.id)
      : undefined,
    schedule: isDefined(entity.schedule)
      ? scheduleSel.getEntity(entity.schedule.id)
      : undefined,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadScanConfig: id => dispatch(loadScanConfig(gmp)(id)),
  loadSchedule: id => dispatch(loadSchedule(gmp)(id)),
});

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(TaskDetails);
