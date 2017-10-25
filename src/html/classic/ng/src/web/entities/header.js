/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';

import PropTypes from '../utils/proptypes.js';

import SelectionType from '../utils/selectiontype.js';

import TableHead from '../components/table/head.js';
import TableHeader from '../components/table/header.js';
import TableRow from '../components/table/row.js';

const defaultactions = (
  <TableHead width="10em">{_('Actions')}</TableHead>
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
export const withEntitiesHeader = (actions_column = defaultactions,
  options = {}) => Component => {

  if (actions_column === false) {
    actions_column = null;
  }

  const HeaderWrapper = props => {
    const {selectionType} = props;
    let column = actions_column;

    if (actions_column === true) {
      if (selectionType === SelectionType.SELECTION_USER) {
        column = <TableHead width="6em">{_('Actions')}</TableHead>;
      }
      else {
        column = null;
      }
    }
    return (
      <Component
        {...options}
        actionsColumn={column}
        {...props}
      />
    );
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
 *                            [['<column_key>', '<column_display_name>'], ...]
 * @param {Element} actions_column   React element, undefined or boolean value.
 * @param {Object}  options   Default properties for Component.
 *
 * @return A new EntitiesHeader component
 */
export const createEntitiesHeader = (columns, actions_column, options = {}) => {

  const Header = ({
    actionsColumn,
    links = true,
    sort = true,
    onSortChange,
  }) => {
    return (
      <TableHeader>
        <TableRow>
          {
            columns.map(column => {
              return (
                <TableHead
                  key={column[0]}
                  sortby={sort ? column[0] : false}
                  onSortChange={onSortChange}>
                  {column[1]}
                </TableHead>
              );
            })
          }
          {actionsColumn}
        </TableRow>
      </TableHeader>
    );
  };

  Header.propTypes = {
    actionsColumn: PropTypes.element,
    links: PropTypes.bool,
    sort: PropTypes.bool,
    onSortChange: PropTypes.func,
  };
  return withEntitiesHeader(actions_column, options)(Header);
};

// vim: set ts=2 sw=2 tw=80:
