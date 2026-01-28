/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import {VerifyIcon, VerifyNoIcon} from 'web/components/icon';
import OsIcon from 'web/components/icon/OsIcon';
import SeverityClassLabel from 'web/components/label/SeverityClass';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import useGmp from 'web/hooks/useGmp';
import {
  AgentIdTableData,
  AgentIdTableHead,
} from 'web/pages/agents/components/AgentIdColumn';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  audit = false,
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}) => {
  const gmp = useGmp();
  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'ip' : false}
          title={_('IP Address')}
          width="10%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hostname' : false}
          title={_('Hostname')}
          width="20%"
          onSortChange={onSortChange}
        />
        <AgentIdTableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'os' : false}
          title={_('OS')}
          width="1%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'portsCount' : false}
          title={_('Ports')}
          width="3%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'appsCount' : false}
          title={_('Apps')}
          width="3%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'distance' : false}
          title={_('Distance')}
          width="3%"
          onSortChange={onSortChange}
        />
        <TableHead title={_('Auth')} width="8%" />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'start' : false}
          title={_('Start')}
          width="13%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'end' : false}
          title={_('End')}
          width="13%"
          onSortChange={onSortChange}
        />
        {audit ? (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'complianceYes' : false}
            title={_('Yes')}
            width="4.5%"
            onSortChange={onSortChange}
          />
        ) : (
          <>
            {useCVSSv3 && (
              <TableHead
                currentSortBy={currentSortBy}
                currentSortDir={currentSortDir}
                sortBy={sort ? 'critical' : false}
                title={_('Critical')}
                onSortChange={onSortChange}
              >
                <SeverityClassLabel.Critical />
              </TableHead>
            )}
            <TableHead
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sortBy={sort ? 'high' : false}
              title={_('High')}
              onSortChange={onSortChange}
            >
              <SeverityClassLabel.High />
            </TableHead>
          </>
        )}
        {audit ? (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'complianceNo' : false}
            title={_('No')}
            width="4.5%"
            onSortChange={onSortChange}
          />
        ) : (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'medium' : false}
            title={_('Medium')}
            onSortChange={onSortChange}
          >
            <SeverityClassLabel.Medium />
          </TableHead>
        )}
        {audit ? (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'complianceIncomplete' : false}
            title={_('Incomplete')}
            width="4.5%"
            onSortChange={onSortChange}
          />
        ) : (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'low' : false}
            title={_('Low')}
            onSortChange={onSortChange}
          >
            <SeverityClassLabel.Low />
          </TableHead>
        )}
        {!audit && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'log' : false}
            title={_('Log')}
            onSortChange={onSortChange}
          >
            <SeverityClassLabel.Log />
          </TableHead>
        )}
        {!audit && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'false_positive' : false}
            title={_('False Positive')}
            onSortChange={onSortChange}
          >
            <SeverityClassLabel.FalsePositive />
          </TableHead>
        )}
        {audit ? (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'complianceTotal' : false}
            title={_('Total')}
            width="4.5%"
            onSortChange={onSortChange}
          />
        ) : (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'total' : false}
            title={_('Total')}
            width="3%"
            onSortChange={onSortChange}
          />
        )}
        {audit ? (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'compliant' : false}
            title={_('Compliant')}
            width="8%"
            onSortChange={onSortChange}
          />
        ) : (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'severity' : false}
            title={_('Severity')}
            width="8%"
            onSortChange={onSortChange}
          />
        )}
      </TableRow>
    </TableHeader>
  );
};

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

  const {agentId, appsCount, best_os_cpe, best_os_txt, distance} = details;
  const gmp = useGmp();
  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  return (
    <TableRow>
      <TableData>
        {isDefined(asset.id) ? (
          <span>
            <DetailsLink id={asset.id} textOnly={!links} type="host">
              {ip}
            </DetailsLink>
          </span>
        ) : (
          <Link filter={'name=' + ip} textOnly={!links} to="hosts">
            {ip}
          </Link>
        )}
      </TableData>
      <TableData>
        <i>{entity.hostname}</i>
      </TableData>
      <AgentIdTableData agentId={agentId} />
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
        <>
          {useCVSSv3 && <TableData>{result_counts.critical}</TableData>}
          <TableData>{result_counts.high}</TableData>
        </>
      )}
      {audit ? (
        <TableData>{complianceCounts.no}</TableData>
      ) : (
        <TableData>{result_counts.medium}</TableData>
      )}
      {audit ? (
        <TableData>{complianceCounts.incomplete}</TableData>
      ) : (
        <TableData>{result_counts.low}</TableData>
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
