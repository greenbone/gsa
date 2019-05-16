/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import OsIcon from 'web/components/icon/osicon';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

const Header = ({currentSortBy, currentSortDir, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'ip' : false}
        onSortChange={onSortChange}
        title={_('IP Address')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hostname' : false}
        onSortChange={onSortChange}
        title={_('Hostname')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'os' : false}
        width="5em"
        onSortChange={onSortChange}
        title={_('OS')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'high' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('High')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'medium' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('Medium')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'low' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('Low')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'log' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('Log')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'false_positive' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('False Positive')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'total' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('Total')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'severity' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('Severity')}
      />
    </TableRow>
  </TableHeader>
);

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({entity, links = true}) => {
  const {ip, details = {}, result_counts = {}, severity, asset = {}} = entity;
  const {best_os_cpe, best_os_txt} = details;
  return (
    <TableRow>
      <TableData>
        {isDefined(asset.id) ? (
          <span>
            <DetailsLink type="host" id={asset.id} textOnly={!links}>
              {ip}
            </DetailsLink>
          </span>
        ) : (
          <Link to="hosts" filter={'name=' + ip} textOnly={!links}>
            {ip}
          </Link>
        )}
      </TableData>
      <TableData>
        <i>{entity.hostname}</i>
      </TableData>
      <TableData align="center">
        <OsIcon osCpe={best_os_cpe} osTxt={best_os_txt} />
      </TableData>
      <TableData>{result_counts.hole}</TableData>
      <TableData>{result_counts.warning}</TableData>
      <TableData>{result_counts.info}</TableData>
      <TableData>{result_counts.log}</TableData>
      <TableData>{result_counts.false_positive}</TableData>
      <TableData>{result_counts.total}</TableData>
      <TableData>
        <SeverityBar severity={severity} />
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Hosts available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
