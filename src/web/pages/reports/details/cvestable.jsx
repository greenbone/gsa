/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {shorten} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import Divider from 'web/components/layout/divider';

import CveLink from 'web/components/link/cvelink';
import DetailsLink from 'web/components/link/detailslink';

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
        title={_('CVE')}
        width="50%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'nvt' : false}
        title={_('NVT')}
        width="30%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hosts' : false}
        title={_('Hosts')}
        width="5%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'occurrences' : false}
        title={_('Occurrences')}
        width="5%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
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
  const {cves, hosts, occurrences, severity, id, nvtName} = entity;
  return (
    <TableRow>
      <TableData>
        <Divider wrap>
          {cves.map(cve => (
            <CveLink key={cve} id={cve} />
          ))}
        </Divider>
      </TableData>
      <TableData>
        <DetailsLink type="nvt" id={id} title={nvtName}>
          {shorten(nvtName, 80)}
        </DetailsLink>
      </TableData>
      <TableData>{hosts.count}</TableData>
      <TableData>{occurrences}</TableData>
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
  emptyTitle: _l('No CVEs available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
