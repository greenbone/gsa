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

import _, {datetime, duration} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import StatusBar from '../../components/bar/statusbar.js';

import Table from '../../components/table/detailstable.js';
import TableBody from '../../components/table/body.js';
import TableRow from '../../components/table/row.js';
import TableData from '../../components/table/data.js';


const ReportScanInfoTable = ({
  filterString,
  report,
}) => {
  const {
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

  const {name, comment, progress} = task;

  let hosts_count;

  if (is_defined(hosts)) {
    const hosts_counts = hosts.getCounts();
    hosts_count = hosts_counts.all;
  }
  else {
    hosts_count = 0;
  }

  if (!is_defined(filterString)) {
    filterString = filter.simple().toFilterString();
  }

  const status = is_defined(task.isContainer) && task.isContainer() ?
    _('Container') : scan_run_status;

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableData>
            {_('Task Name')}
          </TableData>
          <TableData>
            {name}
          </TableData>
        </TableRow>
        {is_defined(comment) &&
          <TableRow>
            <TableData>
              {_('Comment')}
            </TableData>
            <TableData>
              {comment}
            </TableData>
          </TableRow>
        }
        {is_defined(scan_start) &&
          <TableRow>
            <TableData>
              {_('Scan Time')}
            </TableData>
            <TableData>
              {datetime(scan_start)}
              {scan_end ? ' - ' + datetime(scan_end) : ''}
            </TableData>
          </TableRow>
        }
        {is_defined(scan_end) &&
          <TableRow>
            <TableData>
              {_('Scan Duration')}
            </TableData>
            <TableData>
              {duration(scan_start, scan_end)}
            </TableData>
          </TableRow>
        }
        {is_defined(slave) &&
          <TableRow>
            <TableData>
              {_('Scan slave')}
            </TableData>
            <TableData>
              {slave.name}
            </TableData>
          </TableRow>
        }
        <TableRow>
          <TableData>
            {_('Scan Status')}
          </TableData>
          <TableData>
            <StatusBar
              status={status}
              progress={progress}/>
          </TableData>
        </TableRow>
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
  report: PropTypes.model.isRequired,
};

export default ReportScanInfoTable;

// vim: set ts=2 sw=2 tw=80:
