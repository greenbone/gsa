/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {shorten} from 'gmp/utils/string';
import SeverityBar from 'web/components/bar/SeverityBar';
import Divider from 'web/components/layout/Divider';
import CveLink from 'web/components/link/CveLink';
import DetailsLink from 'web/components/link/DetailsLink';
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
        width="50%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'nvt' : false}
        title={_('NVT')}
        width="30%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'hosts' : false}
        title={_('Hosts')}
        width="5%"
        onSortChange={onSortChange}
      />
      <TableHead
        currentSortBy={currentSortBy}
        currentSortDir={currentSortDir}
        sortBy={sort ? 'occurrences' : false}
        title={_('Occurrences')}
        width="5%"
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
        <DetailsLink id={id} title={nvtName} type="nvt">
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
