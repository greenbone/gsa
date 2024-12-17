/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity.js';
import React from 'react';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';
import useGmp from 'web/hooks/useGmp';
import PropTypes from 'web/utils/proptypes';


import CveDetails from './details';
import CveRow from './row';


const Header = ({
  actionsColumn,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const gmp = useGmp();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'description' : false}
          title={_('Description')}
          width={gmp.settings.enableEPSS ? '52%' : '62%'}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'published' : false}
          title={_('Published')}
          width="13%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'cvssBaseVector' : false}
          title={_('CVSS Base Vector')}
          width="17%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'severity' : false}
          title={_('Severity')}
          width="8%"
          onSortChange={onSortChange}
        />
        {gmp.settings.enableEPSS && (
          <TableHead colSpan="2">{_('EPSS')}</TableHead>
        )}
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" rowSpan="2" width="5em">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
      {gmp.settings.enableEPSS && (
        <TableRow>
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'epss_score' : false}
            title={_('Score')}
            width="5%"
            onSortChange={onSortChange}
          />
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'epss_percentile' : false}
            title={_('Percentage')}
            width="5%"
            onSortChange={onSortChange}
          />
        </TableRow>
      )}
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
