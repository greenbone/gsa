/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import OsIcon from 'web/components/icon/OsIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesTable} from 'web/entities/Table';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  audit = false,
  currentSortDir,
  currentSortBy,
  sort = true,
  onSortChange,
}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'name' : false}
        title={_('Operating System')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'cpe' : false}
        title={_('CPE')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'hosts' : false}
        title={_('Hosts')}
        width="10%"
        onSortChange={onSortChange}
      />
      {audit ? (
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'compliant' : false}
          title={_('Compliant')}
          width="10%"
          onSortChange={onSortChange}
        />
      ) : (
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'severity' : false}
          title={_('Severity')}
          width="10%"
          onSortChange={onSortChange}
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

const Row = ({audit = false, entity, links = true}) => {
  const {name, cpe, hosts, severity, compliance} = entity;
  return (
    <TableRow>
      <TableData>
        <Link filter={'name=' + cpe} textOnly={!links} to="operatingsystems">
          <IconDivider>
            <OsIcon osCpe={cpe} osTxt={name} />
            <span>{name}</span>
          </IconDivider>
        </Link>
      </TableData>
      <TableData>
        <Link filter={'name=' + cpe} textOnly={!links} to="operatingsystems">
          {cpe}
        </Link>
      </TableData>
      <TableData>{hosts.count}</TableData>
      {audit && isDefined(compliance) ? (
        <TableData>
          <ComplianceBar compliance={compliance} />
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
  emptyTitle: _l('No Operating Systems available'),
  row: Row,
});
