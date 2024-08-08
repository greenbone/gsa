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

import TargetDetails from './details';
import TargetRow from './row';

const Header = ({
  actionsColumn,
  filter,
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
          width="30%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          width="20%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
          title={_('Hosts')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'ips' : false}
          onSortChange={onSortChange}
          title={_('IPs')}
        />
        <TableHead
          width="15%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'port_list' : false}
          onSortChange={onSortChange}
          title={_('Port List')}
        />
        <TableHead width="15%">{_('Credentials')}</TableHead>
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  filter: PropTypes.filter,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const TargetsHeader = withEntitiesHeader()(Header);

const Footer = createEntitiesFooter({
  span: 6,
  trash: true,
  download: 'targets.xml',
});

export default createEntitiesTable({
  emptyTitle: _l('No targets available'),
  row: TargetRow,
  header: TargetsHeader,
  footer: Footer,
  rowDetails: withRowDetails('target', 10)(TargetDetails),
});

// vim: set ts=2 sw=2 tw=80:
