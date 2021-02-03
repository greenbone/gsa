/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Layout from 'web/components/layout/layout';

import Sort from 'web/components/sortby/sortby';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const TableHead = ({
  children,
  className,
  colSpan,
  rowSpan,
  currentSortBy,
  currentSortDir,
  sort = true,
  sortBy,
  title,
  width,
  onSortChange,
  ...other
}) => {
  let sortSymbol;
  if (isDefined(sortBy) && currentSortBy === sortBy) {
    if (currentSortDir === Sort.DESC) {
      sortSymbol = ( // triangle pointing down
        <span
          title={_('Sorted In Descending Order By {{sortBy}}', {
            sortBy: `${title}`,
          })}
        >
          &nbsp;&#9660;
        </span>
      );
    } else if (currentSortDir === Sort.ASC) {
      sortSymbol = ( // triangle pointing up
        <span
          title={_('Sorted In Ascending Order By {{sortBy}}', {
            sortBy: `${title}`,
          })}
        >
          &nbsp;&#9650;
        </span>
      );
    }
  }
  if (isDefined(title) && !isDefined(children)) {
    children = `${title}`;
  }
  return (
    <th className={className} rowSpan={rowSpan} colSpan={colSpan}>
      {sort && sortBy && isDefined(onSortChange) ? (
        <Sort by={sortBy} onClick={onSortChange}>
          <Layout {...other}>
            {children}
            {sortSymbol}
          </Layout>
        </Sort>
      ) : (
        <Layout {...other}>{children}</Layout>
      )}
    </th>
  );
};

TableHead.propTypes = {
  className: PropTypes.string,
  colSpan: PropTypes.numberString,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  rowSpan: PropTypes.numberString,
  sort: PropTypes.bool,
  sortBy: PropTypes.stringOrFalse,
  title: PropTypes.toString,
  width: PropTypes.string,
  onSortChange: PropTypes.func,
};

export default styled(TableHead)`
  background-color: ${Theme.white};
  color: ${Theme.black};
  border-top: 1px solid ${Theme.lightGray};
  font-weight: bold;
  width: ${props => props.width};

  @media print {
    color: ${Theme.black};
    font-size: 1.2em;
    background-color: none;
    font-weight: bold;
  }
`;

// vim: set ts=2 sw=2 tw=80:
