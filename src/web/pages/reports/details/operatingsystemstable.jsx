/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import ComplianceBar from 'web/components/bar/compliancebar';
import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import OsIcon from 'web/components/icon/osicon';

import {isDefined} from 'gmp/utils/identity';
import IconDivider from 'web/components/layout/icondivider';

import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

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
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'name' : false}
        onSortChange={onSortChange}
        title={_('Operating System')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'cpe' : false}
        onSortChange={onSortChange}
        title={_('CPE')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hosts' : false}
        width="10%"
        onSortChange={onSortChange}
        title={_('Hosts')}
      />
      {audit ? (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'compliant' : false}
          width="10%"
          onSortChange={onSortChange}
          title={_('Compliant')}
        />
      ) : (
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          width="10%"
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

const Row = ({audit = false, entity, links = true}) => {
  const {name, cpe, hosts, severity, compliance} = entity;
  return (
    <TableRow>
      <TableData>
        <Link to="operatingsystems" filter={'name=' + cpe} textOnly={!links}>
          <IconDivider>
            <OsIcon osCpe={cpe} osTxt={name} />
            <span>{name}</span>
          </IconDivider>
        </Link>
      </TableData>
      <TableData>
        <Link to="operatingsystems" filter={'name=' + cpe} textOnly={!links}>
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

// vim: set ts=2 sw=2 tw=80:
