/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import ArrowDown from 'web/components/icon/ArrowDown';
import ArrowUp from 'web/components/icon/ArrowUp';
import ArrowUpDown from 'web/components/icon/ArrowUpDown';
import Layout from 'web/components/layout/Layout';
import Sort from 'web/components/sortby/SortBy';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const SortSymbol = styled.span`
  display: inline-flex;
  align-items: center;
`;

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
  const getSortSymbol = () => {
    if (!isDefined(sortBy) || currentSortBy !== sortBy) {
      return (
        <SortSymbol title={_('Not Sorted')}>
          &nbsp;
          <ArrowUpDown />
        </SortSymbol>
      );
    }
    const titleText =
      currentSortDir === Sort.DESC
        ? _('Sorted In Descending Order By {{sortBy}}', {sortBy: `${title}`})
        : _('Sorted In Ascending Order By {{sortBy}}', {sortBy: `${title}`});
    const Icon = currentSortDir === Sort.DESC ? ArrowDown : ArrowUp;
    return (
      <SortSymbol title={titleText}>
        &nbsp;
        <Icon />
      </SortSymbol>
    );
  };

  if (isDefined(title) && !isDefined(children)) {
    children = `${title}`;
  }

  return (
    <th className={className} colSpan={colSpan} rowSpan={rowSpan}>
      {sort && sortBy && isDefined(onSortChange) ? (
        <Sort by={sortBy} onClick={onSortChange}>
          <Layout {...other}>
            {children}
            {getSortSymbol()}
          </Layout>
        </Sort>
      ) : (
        <Layout {...other}>{children}</Layout>
      )}
    </th>
  );
};

TableHead.propTypes = {
  children: PropTypes.node,
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
