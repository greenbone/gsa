/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import CveLink from 'web/components/link/CveLink';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesTable} from 'web/entities/Table';
import PropTypes from 'web/utils/PropTypes';

const Header = ({currentSortDir, currentSortBy, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'cve' : false}
        title={_('CVE')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'host' : false}
        title={_('Host')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'nvt' : false}
        title={_('NVT')}
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'severity' : false}
        title={_('Severity')}
        width="10%"
        onSortChange={onSortChange}
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
            <DetailsLink id={host.id} type="host">
              {host.ip}
            </DetailsLink>
          </span>
        ) : (
          <Link filter={'name=' + host.ip} to="hosts">
            {host.ip}
          </Link>
        )}
      </TableData>
      <TableData>
        <span>
          <DetailsLink id={source.name} type="nvt">
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
