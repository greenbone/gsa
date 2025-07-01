/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  actions = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="72%"
          onSortChange={onSortChange}
        />
        <TableHead colSpan="2" width="10%">
          {_('Family')}
        </TableHead>
        <TableHead colSpan="2" width="10%">
          {_('NVTs')}
        </TableHead>
        {actions && (
          <TableHead align="center" rowSpan="2" width="8%">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>

      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'families_total' : false}
          title={_('Total')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'families_trend' : false}
          title={_('Trend')}
          width="5%"
          onSortChange={onSortChange}
        />

        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'nvts_total' : false}
          title={_('Total')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'nvts_trend' : false}
          title={_('Trend')}
          width="5%"
          onSortChange={onSortChange}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default Header;
