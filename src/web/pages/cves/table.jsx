/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import CveDetails from './details';
import CveRow from './row';
import {isDefined} from "gmp/utils/identity.js";

const Header = ({
  actionsColumn,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          rowSpan="2"
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          rowSpan="2"
          width="52%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'description' : false}
          onSortChange={onSortChange}
          title={_('Description')}
        />
        <TableHead
          rowSpan="2"
          width="13%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'published' : false}
          onSortChange={onSortChange}
          title={_('Published')}
        />
        <TableHead
          rowSpan="2"
          width="17%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'cvssBaseVector' : false}
          onSortChange={onSortChange}
          title={_('CVSS Base Vector')}
        />
        <TableHead
          rowSpan="2"
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead colSpan="2">
          {_("EPSS")}
        </TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead rowSpan="2" width="5em" align="center">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
      <TableRow>
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'epss_score' : false}
          onSortChange={onSortChange}
          title={_('Score')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'epss_percentile' : false}
          onSortChange={onSortChange}
          title={_('Percentile')}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const CvesHeader = withEntitiesHeader(true)(Header);

const CvesFooter = createEntitiesFooter({
  span: 10,
  download: 'cves.xml',
});

export const CvesTable = createEntitiesTable({
  emptyTitle: _l('No CVEs available'),
  row: CveRow,
  rowDetails: withRowDetails('cve')(CveDetails),
  header: CvesHeader,
  footer: CvesFooter,
});

export default CvesTable;

// vim: set ts=2 sw=2 tw=80:
