/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';
import ComplianceBar from 'web/components/bar/compliancebar';

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

const Header = ({
  audit = false,
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}) => (
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
      {audit ? (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'complianceYes' : false}
          width="4.5%"
          onSortChange={onSortChange}
          title={_('Yes')}
        />
      ) : (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'high' : false}
          width="3%"
          onSortChange={onSortChange}
          title={_('High')}
        />
      )}
      {audit ? (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'complianceNo' : false}
          width="4.5%"
          onSortChange={onSortChange}
          title={_('No')}
        />
      ) : (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'medium' : false}
          width="3%"
          onSortChange={onSortChange}
          title={_('Medium')}
        />
      )}
      {audit ? (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'complianceIncomplete' : false}
          width="4.5%"
          onSortChange={onSortChange}
          title={_('Incomplete')}
        />
      ) : (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'low' : false}
          width="3%"
          onSortChange={onSortChange}
          title={_('Low')}
        />
      )}
      {!audit && (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'log' : false}
          width="3%"
          onSortChange={onSortChange}
          title={_('Log')}
        />
      )}
      {!audit && (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'false_positive' : false}
          width="3%"
          onSortChange={onSortChange}
          title={_('False Positive')}
        />
      )}
      {audit ? (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'complianceTotal' : false}
          width="4.5%"
          onSortChange={onSortChange}
          title={_('Total')}
        />
      ) : (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'total' : false}
          width="3%"
          onSortChange={onSortChange}
          title={_('Total')}
        />
      )}
      {audit ? (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'compliant' : false}
          width="8%"
          onSortChange={onSortChange}
          title={_('Compliant')}
        />
      ) : (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          width="8%"
          onSortChange={onSortChange}
          title={_('Severity')}
        />
      )}
    </TableRow>
  </TableHeader>
);

Header.propTypes = {
  audit: PropTypes.bool,
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

const Row = ({entity, links = true, audit = false}) => {
  const {
    asset = {},
    authSuccess,
    details = {},
    end,
    hostCompliance,
    ip,
    result_counts = {},
    complianceCounts = {},
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
      {audit ? (
        <TableData>{complianceCounts.yes}</TableData>
      ) : (
        <TableData>{result_counts.high}</TableData>
      )}
      {audit ? (
        <TableData>{complianceCounts.no}</TableData>
      ) : (
        <TableData>{result_counts.warning}</TableData>
      )}
      {audit ? (
        <TableData>{complianceCounts.incomplete}</TableData>
      ) : (
        <TableData>{result_counts.info}</TableData>
      )}
      {!audit && <TableData>{result_counts.log}</TableData>}
      {!audit && <TableData>{result_counts.false_positive}</TableData>}
      {audit ? (
        <TableData>{complianceCounts.total}</TableData>
      ) : (
        <TableData>{result_counts.total}</TableData>
      )}
      {audit ? (
        <TableData>
          <ComplianceBar compliance={hostCompliance} />
        </TableData>
      ) : (
        <TableData>
          <SeverityBar severity={severity} />
        </TableData>
      )}
    </TableRow>
  );
};

Row.propTypes = {
  audit: PropTypes.bool,
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Hosts available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
