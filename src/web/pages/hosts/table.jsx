/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

import EntitiesFooter, {withEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import NewIcon from 'web/components/icon/newicon';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import HostDetails from './details';
import HostRow from './row';

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
          width="19%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          width="35%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hostname' : false}
          onSortChange={onSortChange}
          title={_('Hostname')}
        />
        <TableHead
          width="15%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'ip' : false}
          onSortChange={onSortChange}
          title={_('IP Address')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'os' : false}
          onSortChange={onSortChange}
          title={_('OS')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}
          title={_('Modified')}
        />
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

const HostsHeader = withEntitiesHeader()(Header);

const Footer = ({
  entities,
  entitiesSelected,
  filter,
  selectionType,
  onTargetCreateFromSelection,
  ...props
}) => {
  let title;
  let has_selected;
  let value;
  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    title = _('Create Target from page contents');
    has_selected = entities.length > 0;
    value = {
      entities,
      filter,
      selectionType,
    };
  } else if (selectionType === SelectionType.SELECTION_USER) {
    title = _('Create Target from selection');
    has_selected = isDefined(entitiesSelected) && entitiesSelected.size > 0;
    value = {
      entitiesSelected,
      selectionType,
    };
  } else {
    title = _('Create Target form all filtered');
    value = {
      entities,
      filter,
      selectionType,
    };
    has_selected = true;
  }
  return (
    <EntitiesFooter {...props} selectionType={selectionType}>
      <NewIcon
        active={has_selected}
        title={title}
        value={value}
        onClick={onTargetCreateFromSelection}
      />
    </EntitiesFooter>
  );
};

Footer.propTypes = {
  entities: PropTypes.array.isRequired,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter.isRequired,
  selectionType: PropTypes.string,
  onTargetCreateFromSelection: PropTypes.func.isRequired,
};

const HostsFooter = withEntitiesFooter({
  span: 7,
  delete: true,
  download: 'hosts.xml',
})(Footer);

export const HostsTable = createEntitiesTable({
  emptyTitle: _l('No hosts available'),
  row: HostRow,
  rowDetails: withRowDetails('host', 10)(HostDetails),
  header: HostsHeader,
  footer: HostsFooter,
});

export default HostsTable;

// vim: set ts=2 sw=2 tw=80:
