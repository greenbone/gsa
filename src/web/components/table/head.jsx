/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
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
      sortSymbol = // triangle pointing down
        (
          <span
            title={_('Sorted In Descending Order By {{sortBy}}', {
              sortBy: `${title}`,
            })}
          >
            &nbsp;&#9660;
          </span>
        );
    } else if (currentSortDir === Sort.ASC) {
      sortSymbol = // triangle pointing up
        (
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
    <th className={className} colSpan={colSpan} rowSpan={rowSpan}>
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
    background-color: transparent;
    font-weight: bold;
  }
`;
