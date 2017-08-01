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

import moment from 'moment';

import _, {long_date} from 'gmp/locale.js';
import {is_defined, YES_VALUE} from 'gmp/utils.js';

import {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig.js';
import {scanner_type_name} from 'gmp/models/scanner.js';

import PropTypes from '../../utils/proptypes.js';
import {render_yesno} from '../../utils/render.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import InfoTable from '../../components/table/info.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import DetailsBlock from '../../entity/block.js';

const TaskDetails = ({
  className,
  links = true,
  entity,
}) => {
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
    preferences,
    scanner,
    schedule,
    schedule_periods,
    target,
  } = entity;
  const {max_checks = {}, iface = {}, max_hosts} = preferences;

  let duration = _('Not finished yet');
  if (is_defined(last_report) && is_defined(last_report.scan_end)) {
    const diff = last_report.scan_end.diff(last_report.scan_start);
    duration = moment.duration(diff).humanize();
  }

  const av_duration = is_defined(average_duration) ?
    average_duration.humanize() : '';
  return (
    <Layout
      grow="1"
      flex="column">

      {is_defined(target) &&
        <DetailsBlock
          title={_('Target')}>
          <DetailsLink
            textOnly={!links}
            type="target"
            id={target.id}>
            {target.name}
          </DetailsLink>
        </DetailsBlock>
      }

      {is_defined(alerts) &&
        <DetailsBlock
          title={_('Alerts')}>
          <Divider>
            {
              alerts.map(alert => (
                <DetailsLink
                  key={alert.id}
                  legacy
                  textOnly={!links}
                  type="alert"
                  id={alert.id}>
                  {alert.name}
                </DetailsLink>
              ))
            }
          </Divider>
        </DetailsBlock>
      }

      {is_defined(scanner) &&
        <DetailsBlock
          title={_('Scanner')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Name')}
                </TableData>
                <TableData>
                  <DetailsLink
                    legacy
                    textOnly={!links}
                    type="scanner"
                    id={scanner.id}>
                    {scanner.name}
                  </DetailsLink>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Type')}
                </TableData>
                <TableData>
                  {scanner_type_name(scanner.scanner_type)}
                </TableData>
              </TableRow>
              {is_defined(config) &&
                <TableRow>
                  <TableData>
                    {_('Scan Config')}
                  </TableData>
                  <TableData>
                    <DetailsLink
                      legacy
                      textOnly={!links}
                      type="config"
                      id={config.id}>
                      {config.name}
                    </DetailsLink>
                  </TableData>
                </TableRow>
              }
              {is_defined(config) &&
                config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE &&
                <TableRow>
                  <TableData>
                    {_('Order for target hosts')}
                  </TableData>
                  <TableData>
                    {hosts_ordering}
                  </TableData>
                </TableRow>
              }
              {is_defined(config) &&
                config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE &&
                <TableRow>
                  <TableData>
                    {_('Network Source Interface')}
                  </TableData>
                  <TableData>
                    {iface.value}
                  </TableData>
                </TableRow>
              }
              {is_defined(config) &&
                config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE &&
                is_defined(max_checks.name) &&
                <TableRow>
                  <TableData>
                    {_('Maximum concurrently executed NVTs per host')}
                  </TableData>
                  <TableData>
                    {max_checks.value}
                  </TableData>
                </TableRow>
              }
              {is_defined(config) &&
                config.scan_config_type === OPENVAS_SCAN_CONFIG_TYPE &&
                is_defined(max_hosts.name) &&
                <TableRow>
                  <TableData>
                    {_('Maximum concurrently scanned hosts')}
                  </TableData>
                  <TableData>
                    {max_hosts.value}
                  </TableData>
                </TableRow>
              }
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }

      <DetailsBlock
        title={_('Assets')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Add to Assets')}
              </TableData>
              <TableData>
                {render_yesno(in_assets)}
              </TableData>
            </TableRow>

            {in_assets === YES_VALUE &&
              <TableRow>
                <TableData>
                  {_('Apply to Overrides')}
                </TableData>
                <TableData>
                  {render_yesno(apply_overrides)}
                </TableData>
              </TableRow>
            }

            {in_assets === YES_VALUE &&
              <TableRow>
                <TableData>
                  {_('Min QoD')}
                </TableData>
                <TableData>
                  {min_qod + ' %'}
                </TableData>
              </TableRow>
            }
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {is_defined(schedule) &&
        <DetailsBlock
          title={_('Schedule')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Name')}
                </TableData>
                <TableData>
                  <DetailsLink
                    legacy
                    textOnly={!links}
                    type="schedule"
                    id={schedule.id}
                  >
                    {schedule.name}
                  </DetailsLink>
                </TableData>
              </TableRow>
              <TableRow>
                <TableData>
                  {_('Next')}
                </TableData>
                <TableData>
                  {long_date(schedule.next_time)}
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }

      <DetailsBlock
        title={_('Scan')}>
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Duration of last Scan')}
              </TableData>
              <TableData>
                {duration}
              </TableData>
            </TableRow>
            {is_defined(average_duration) &&
              <TableRow>
                <TableData>
                  {_('Average Scan duration')}
                </TableData>
                <TableData>
                  {av_duration}
                </TableData>
              </TableRow>
            }
            {schedule_periods > 0 &&
              <TableRow>
                <TableData>
                  {_('Period')}
                </TableData>
                <TableData>
                  {schedule_periods > 1 ?
                      _('{{nr}} more times', {nr: schedule_periods}) :
                      _('Once')
                  }
                </TableData>
              </TableRow>
            }
            <TableRow>
              <TableData>
                {_('Auto delete Reports')}
              </TableData>
              <TableData>
                {auto_delete === 'keep' ?
                  _('Automatically delete oldest reports but always keep ' +
                    'newest {{nr}} reports', {nr: auto_delete_data}) :
                  _('Do not automatically delete reports')
                }
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>
    </Layout>
  );
};

TaskDetails.propTypes = {
  className: PropTypes.string,
  links: PropTypes.bool,
  entity: PropTypes.model.isRequired,
};

export default TaskDetails;

// vim: set ts=2 sw=2 tw=80:
