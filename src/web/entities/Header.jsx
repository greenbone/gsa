/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHeader from 'web/components/table/Header';
import TableHead from 'web/components/table/TableHead';
import TableRow from 'web/components/table/TableRow';
import PropTypes from 'web/utils/PropTypes';
import SelectionType from 'web/utils/SelectionType';

const defaultActions = (
  <TableHead align="center" title={_l('Actions')} width="8%" />
);

/**
 * A higher order component to create table headers which support entity
 * selection.
 *
 * If a React element instance is passed via actionsColumn, the element will be
 * forwarded as actionsColumn to the Component.
 *
 * If actionsColumn is undefined, a default table head column will be passed as
 * actionsColumn to the Component.
 *
 * If actionsColumn is true, a default table head column will be passed as actionsColumn
 * to the Component if the current selectionType (passed via props) is SELECTION_USER.
 *
 * If actionsColumn is false, no actions (a null value in React) will be passed to
 * the Component.
 *
 * @param {React.Element|undefined|boolean} actionsColumn - React element, undefined, or boolean value.
 * @param {Object} options - Default properties for the Component.
 * @param {React.Component} Component - React component rendered as header.
 *
 * @return {React.Component} A new EntitiesHeader component.
 */
export const withEntitiesHeader =
  (actionsColumn = defaultActions, options = {}) =>
  Component => {
    if (!actionsColumn) {
      actionsColumn = null;
    }

    const HeaderWrapper = props => {
      const {selectionType} = props;
      let column = actionsColumn;

      if (actionsColumn && selectionType === SelectionType.SELECTION_USER) {
        column = <TableHead width="6em">{_('Actions')}</TableHead>;
      } else if (actionsColumn === true) {
        column = null;
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
 * array.
 *
 * @param {Array<Object>} columns - An array of column description objects in the form of:
 *                                  [{
 *                                      name: 'foo',
 *                                      displayName: _l('Foo'),
 *                                      width: '20%',
 *                                      align: ['center', 'center'],
 *                                   }, {
 *                                     ...
 *                                   }, ... ]
 * @param {React.Element|undefined|boolean} actionsColumn - React element, undefined, or boolean value.
 * @param {Object} options - Default properties for the Component.
 *
 * @return {React.Component} A new EntitiesHeader component.
 */
export const createEntitiesHeader = (columns, actionsColumn, options = {}) => {
  const Header = ({
    actionsColumn,
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
              currentSortBy={currentSortBy}
              currentSortDir={currentSortDir}
              sortBy={sort ? name : false}
              title={`${displayName}`}
              width={width}
              onSortChange={onSortChange}
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
    sort: PropTypes.bool,
    onSortChange: PropTypes.func,
  };
  return withEntitiesHeader(actionsColumn, options)(Header);
};
