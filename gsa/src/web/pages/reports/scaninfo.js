/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {duration as createDuration} from 'gmp/models/date';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import StatusBar from '../../components/bar/statusbar.js';

import DetailsLink from '../../components/link/detailslink.js';

import Table from '../../components/table/detailstable.js';
import TableBody from '../../components/table/body.js';
import TableRow from '../../components/table/row.js';
import TableData from '../../components/table/data.js';

const scanDuration = (start, end) => {
  const dur = createDuration(end.diff(start));
  const hours = dur.hours();
  const days = dur.days();

  let minutes = dur.minutes();
  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  if (days === 0) {
    return _('{{hours}}:{{minutes}} h', {hours, minutes});
  }

  if (days === 1) {
    return _('{{days}} day {{hours}}:{{minutes}} h', {
      days,
      hours,
      minutes,
    });
  }

  return _('{{days}} days {{hours}}:{{minutes}} h', {
    days,
    hours,
    minutes,
  });
};

const ReportScanInfoTable = ({
  filterString,
  links = true,
  report,
}) => {
  const {
    delta_report,
    filter,
    hosts,
    scan_end,
    scan_run_status,
    scan_start,
    slave,
    task = {},
    timezone,
    timezone_abbrev,
  } = report;

  const {id, name, comment, progress} = task;

  const hosts_count = isDefined(hosts) && isDefined(hosts.counts) ?
    hosts.counts.all : 0;

  if (!isDefined(filterString)) {
    filterString = filter.simple().toFilterString();
  }

  const status = isDefined(task.isContainer) && task.isContainer() ?
    _('Container') : scan_run_status;

  const delta = report.isDeltaReport();

  const is_ended = isDefined(scan_end) && scan_end.isValid();
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableData>
            {_('Task Name')}
          </TableData>
          <TableData>
            <DetailsLink
              textOnly={!links}
              type="task"
              id={id}
            >
              {name}
            </DetailsLink>
          </TableData>
        </TableRow>
        {isDefined(comment) &&
          <TableRow>
            <TableData>
              {_('Comment')}
            </TableData>
            <TableData>
              {comment}
            </TableData>
          </TableRow>
        }
        {delta &&
          <TableRow>
            <TableData>
              {_('Report 1')}
            </TableData>
            <TableData>
              <DetailsLink
                textOnly={!links}
                type="report"
                id={report.id}
              >
                {report.id}
              </DetailsLink>
            </TableData>
          </TableRow>
        }
        {isDefined(scan_start) &&
          <TableRow>
            <TableData>
              {delta ? _('Scan Time Report 1') : _('Scan Time')}
            </TableData>
            <TableData>
              {longDate(scan_start)}
              {is_ended ? ' - ' + longDate(scan_end) : ''}
            </TableData>
          </TableRow>
        }
        {is_ended &&
          <TableRow>
            <TableData>
              {delta ? _('Scan  Duration Report 1') : _('Scan Duration')}
            </TableData>
            <TableData>
              {scanDuration(scan_start, scan_end)}
            </TableData>
          </TableRow>
        }
        <TableRow>
          <TableData>
            {delta ? _('Scan Status Report 1') : _('Scan Status')}
          </TableData>
          <TableData>
            <StatusBar
              status={status}
              progress={progress}
            />
          </TableData>
        </TableRow>
        {delta &&
          <TableRow>
            <TableData>
              {_('Report 2')}
            </TableData>
            <TableData>
              <DetailsLink
                textOnly={!links}
                type="report"
                id={delta_report.id}
              >
                {delta_report.id}
              </DetailsLink>
            </TableData>
          </TableRow>
        }
        {delta &&
          <TableRow>
            <TableData>
              {_('Scan Time Report 2')}
            </TableData>
            <TableData>
              {longDate(delta_report.scan_start)}
              {isDefined(delta_report.scan_end) &&
                delta_report.scan_end.isValid() ?
                ' - ' + longDate(delta_report.scan_end) : ''}
            </TableData>
          </TableRow>
        }
        {delta && delta_report.scan_end.isValid() &&
          <TableRow>
            <TableData>
              {_('Scan  Duration Report 2')}
            </TableData>
            <TableData>
              {scanDuration(delta_report.scan_start, delta_report.scan_end)}
            </TableData>
          </TableRow>
        }
        {delta &&
          <TableRow>
            <TableData>
              {_('Scan Status Report 2')}
            </TableData>
            <TableData>
              <StatusBar
                status={delta_report.scan_run_status}
              />
            </TableData>
          </TableRow>
        }
        {isDefined(slave) &&
          <TableRow>
            <TableData>
              {_('Scan slave')}
            </TableData>
            <TableData>
              {slave.name}
            </TableData>
          </TableRow>
        }
        {hosts_count > 0 &&
          <TableRow>
            <TableData>
              {_('Hosts scanned')}
            </TableData>
            <TableData>{hosts_count}</TableData>
          </TableRow>
        }
        <TableRow>
          <TableData>
            {_('Filter')}
          </TableData>
          <TableData>{filterString}</TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Timezone')}
          </TableData>
          <TableData>
            {timezone} ({timezone_abbrev})
          </TableData>
        </TableRow>
      </TableBody>
    </Table>
  );
};

ReportScanInfoTable.propTypes = {
  filterString: PropTypes.string,
  links: PropTypes.bool,
  report: PropTypes.model.isRequired,
};

export default ReportScanInfoTable;

// vim: set ts=2 sw=2 tw=80:
