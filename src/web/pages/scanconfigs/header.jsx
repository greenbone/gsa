/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

const Header = ({
  actions = true,
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
          width="72%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead width="10%" colSpan="2">
          {_('Family')}
        </TableHead>
        <TableHead width="10%" colSpan="2">
          {_('NVTs')}
        </TableHead>
        {actions && (
          <TableHead rowSpan="2" width="8%" align="center">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>

      <TableRow>
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'families_total' : false}
          onSortChange={onSortChange}
          title={_('Total')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'families_trend' : false}
          onSortChange={onSortChange}
          title={_('Trend')}
        />

        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'nvts_total' : false}
          onSortChange={onSortChange}
          title={_('Total')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'nvts_trend' : false}
          onSortChange={onSortChange}
          title={_('Trend')}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default Header;

// vim: set ts=2 sw=2 tw=80:
