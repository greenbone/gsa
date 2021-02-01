/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

import SelectionType from 'web/utils/selectiontype';

const defaultactions = (
  <TableHead width="8%" align="center" title={_l('Actions')} />
);

/**
 * A higher order component to create table headers which support entity
 * selection
 *
 * If a react element instance is passed via actions the element will be
 * forwarded as actions to Component.
 *
 * If actions is undefined a default table head column will be passed as
 * actions to Component.
 *
 * If actions is true a default table head column will be passed as actions to
 * Component if the current selectionType (passed via props) is SELECTION_USER.
 *
 * If actions is false no actions (a null value in react) will be passed to
 * Component.
 *
 * @param {Element}   actions_column  React element, undefined or boolean value.
 * @param {Object}    options         Default properties for Component.
 * @param {Component} Component       React component rendered as header
 *
 * @return A new EntitiesHeader component
 */
export const withEntitiesHeader = (
  actions_column = defaultactions,
  options = {},
) => Component => {
  if (actions_column === false) {
    actions_column = null;
  }

  const HeaderWrapper = props => {
    const {selectionType} = props;
    let column = actions_column;

    if (actions_column === true) {
      if (selectionType === SelectionType.SELECTION_USER) {
        column = <TableHead width="6em">{_('Actions')}</TableHead>;
      } else {
        column = null;
      }
    }
    return <Component {...options} actionsColumn={column} {...props} />;
  };

  HeaderWrapper.propTypes = {
    selectionType: PropTypes.oneOf([
      SelectionType.SELECTION_PAGE_CONTENTS,
      SelectionType.SELECTION_USER,
      SelectionType.SELECTION_FILTER,
    ]),
  };

  return HeaderWrapper;
};

/**
 * A higher order component to create table headers from a column description
 * array
 *
 * @param {Array}   columns   An array in the form of
 *                            [{
 *                                name: 'foo',
 *                                displayName: _l('Foo'),
 *                                width: '20%',
 *                                align: ['center', 'center'],
 *                             }, {
 *                               ...
 *                             }, ... ]
 * @param {Element} actions_column   React element, undefined or boolean value.
 * @param {Object}  options   Default properties for Component.
 *
 * @return A new EntitiesHeader component
 */
export const createEntitiesHeader = (columns, actions_column, options = {}) => {
  const Header = ({
    actionsColumn,
    links = true,
    currentSortBy,
    currentSortDir,
    sort = true,
    onSortChange,
  }) => (
    <TableHeader>
      <TableRow>
        {columns.map(column => {
          const {name, displayName, width, align} = column;
          return (
            <TableHead
              key={name}
              align={align}
              width={width}
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sortBy={sort ? name : false}
              onSortChange={onSortChange}
              title={`${displayName}`}
            />
          );
        })}
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );

  Header.propTypes = {
    actionsColumn: PropTypes.element,
    currentSortBy: PropTypes.string,
    currentSortDir: PropTypes.string,
    links: PropTypes.bool,
    sort: PropTypes.bool,
    onSortChange: PropTypes.func,
  };
  return withEntitiesHeader(actions_column, options)(Header);
};

// vim: set ts=2 sw=2 tw=80:
