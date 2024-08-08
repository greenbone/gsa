/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import CveLink from 'web/components/link/cvelink';
import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

const Header = ({currentSortDir, currentSortBy, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'cve' : false}
        onSortChange={onSortChange}
        title={_('CVE')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'host' : false}
        onSortChange={onSortChange}
        title={_('Host')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'nvt' : false}
        onSortChange={onSortChange}
        title={_('NVT')}
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

const Row = ({entity}) => {
  const {cveId, host, source, severity} = entity;
  return (
    <TableRow>
      <TableData>
        <span>
          <CveLink id={cveId} />
        </span>
      </TableData>
      <TableData>
        {isDefined(host.id) ? (
          <span>
            <DetailsLink type="host" id={host.id}>
              {host.ip}
            </DetailsLink>
          </span>
        ) : (
          <Link to="hosts" filter={'name=' + host.ip}>
            {host.ip}
          </Link>
        )}
      </TableData>
      <TableData>
        <span>
          <DetailsLink type="nvt" id={source.name}>
            {source.description}
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <SeverityBar severity={severity} />
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Closed CVEs available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
