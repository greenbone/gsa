/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import NewIcon from 'web/components/icon/NewIcon';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import EntitiesFooter, {withEntitiesFooter} from 'web/entities/Footer';
import {withEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

import HostDetails from './Details';
import HostRow from './Row';

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
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="19%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hostname' : false}
          title={_('Hostname')}
          width="35%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'ip' : false}
          title={_('IP Address')}
          width="15%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'os' : false}
          title={_('OS')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'severity' : false}
          title={_('Severity')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'modified' : false}
          title={_('Modified')}
          width="10%"
          onSortChange={onSortChange}
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
