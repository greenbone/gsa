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

import Row from './row';
import AuditDetails from 'web/pages/audits/details';

const Header = ({
  actionsColumn,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const sortProps = {
    currentSortBy,
    currentSortDir,
    sort,
    onSortChange,
  };
  return (
    <TableHeader>
      <TableRow>
        <TableHead {...sortProps} sortBy="name" width="52%" title={_('Name')} />
        <TableHead
          {...sortProps}
          width="8%"
          sortBy="status"
          title={_('Status')}
        />
        <TableHead
          {...sortProps}
          sortBy="last"
          width="24%"
          title={_('Report')}
        />
        <TableHead width="8%" title={_('Compliance Status')} />
        {actionsColumn}
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

const actionsColumn = (
  <TableHead width="10em" title={_l('Actions')} align="center" />
);

export default createEntitiesTable({
  emptyTitle: _l('No Audits available'),
  row: Row,
  rowDetails: withRowDetails('audit', 10)(AuditDetails),
  header: withEntitiesHeader(actionsColumn)(Header),
  footer: createEntitiesFooter({
    span: 5,
    trash: true,
    tags: false,
    download: 'audits.xml',
  }),
});
