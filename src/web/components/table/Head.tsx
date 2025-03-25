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
import Sort, {ByType, DESC} from 'web/components/sortby/SortBy';
import Theme from 'web/utils/Theme';

const SortSymbol = styled.span`
  display: inline-flex;
  align-items: center;
`;

interface TableHeadProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  currentSortBy?: ByType;
  currentSortDir?: string;
  rowSpan?: number;
  sort?: boolean;
  sortBy?: ByType;
  title?: string;
  width?: string;
  onSortChange?: (sortBy: ByType) => void;
}

const TableHead: React.FC<TableHeadProps> = ({
  children,
  className,
  colSpan,
  rowSpan,
  currentSortBy,
  currentSortDir,
  sort = true,
  sortBy,
  title,
  onSortChange,
  ...other
}: TableHeadProps) => {
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
      currentSortDir === DESC
        ? _('Sorted In Descending Order By {{sortBy}}', {sortBy: `${title}`})
        : _('Sorted In Ascending Order By {{sortBy}}', {sortBy: `${title}`});
    const Icon = currentSortDir === DESC ? ArrowDown : ArrowUp;
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
