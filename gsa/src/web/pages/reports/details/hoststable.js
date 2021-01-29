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
import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import DateTime from 'web/components/date/datetime';

import OsIcon from 'web/components/icon/osicon';
import VerifyIcon from 'web/components/icon/verifyicon';
import VerifyNoIcon from 'web/components/icon/verifynoicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

import PropTypes from 'web/utils/proptypes';

const Header = ({currentSortBy, currentSortDir, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'ip' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('IP Address')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hostname' : false}
        width="20%"
        onSortChange={onSortChange}
        title={_('Hostname')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'os' : false}
        width="1%"
        onSortChange={onSortChange}
        title={_('OS')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'portsCount' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Ports')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'appsCount' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Apps')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'distance' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Distance')}
      />
      <TableHead width="8%" title={_('Auth')} />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'start' : false}
        width="13%"
        onSortChange={onSortChange}
        title={_('Start')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'end' : false}
        width="13%"
        onSortChange={onSortChange}
        title={_('End')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'high' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('High')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'medium' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Medium')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'low' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Low')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'log' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Log')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'false_positive' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('False Positive')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'total' : false}
        width="3%"
        onSortChange={onSortChange}
        title={_('Total')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'severity' : false}
        width="8%"
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

const renderAuthIcons = authSuccess => {
  const {smb, snmp, esxi, ssh} = authSuccess;
  const showSmbSuccess = smb === true;
  const showSmbFailure = smb === false;
  const showSnmpSuccess = snmp === true;
  const showSnmpFailure = snmp === false;
  const showEsxiSuccess = esxi === true;
  const showEsxiFailure = esxi === false;
  const showSshSuccess = ssh === true;
  const showSshFailure = ssh === false;
  return (
    <IconDivider>
      {showSmbSuccess && (
        <VerifyIcon title={_('SMB authentication was successful')} />
      )}
      {showSmbFailure && (
        <VerifyNoIcon title={_('SMB authentication was unsuccessful')} />
      )}
      {showSnmpSuccess && (
        <VerifyIcon title={_('SNMP authentication was successful')} />
      )}
      {showSnmpFailure && (
        <VerifyNoIcon title={_('SNMP authentication was unsuccessful')} />
      )}
      {showEsxiSuccess && (
        <VerifyIcon title={_('ESXi authentication was successful')} />
      )}
      {showEsxiFailure && (
        <VerifyNoIcon title={_('ESXi authentication was unsuccessful')} />
      )}
      {showSshSuccess && (
        <VerifyIcon title={_('SSH authentication was successful')} />
      )}
      {showSshFailure && (
        <VerifyNoIcon title={_('SSH authentication was unsuccessful')} />
      )}
    </IconDivider>
  );
};

const Row = ({entity, links = true}) => {
  const {
    asset = {},
    authSuccess,
    details = {},
    end,
    ip,
    result_counts = {},
    severity,
    start,
    portsCount,
  } = entity;

  const {appsCount, best_os_cpe, best_os_txt, distance} = details;
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
      <TableData>{portsCount}</TableData>
      <TableData>{appsCount}</TableData>
      <TableData>{distance}</TableData>
      <TableData>{renderAuthIcons(authSuccess)}</TableData>
      <TableData>
        <DateTime date={start} />
      </TableData>
      <TableData>
        <DateTime date={end} />
      </TableData>
      <TableData>{result_counts.high}</TableData>
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
