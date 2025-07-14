/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import {ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import Sort, {DESC} from 'web/components/sortby/SortBy';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

const SortSymbol = styled.span`
  display: inline-flex;
  align-items: center;
`;

interface TableHeadProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  currentSortBy?: string;
  currentSortDir?: string;
  rowSpan?: number;
  sort?: boolean;
  sortBy?: string;
  title?: string;
  width?: string;
  onSortChange?: (sortBy: string) => void;
}

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
  onSortChange,
  ...other
}: TableHeadProps) => {
  const [_] = useTranslation();
  const getSortSymbol = () => {
    if (!isDefined(sortBy) || currentSortBy !== sortBy) {
      return (
        <SortSymbol title={_('Not Sorted')}>
          &nbsp;
          <ArrowUpDownIcon />
        </SortSymbol>
      );
    }
    const titleText =
      currentSortDir === DESC
        ? _('Sorted In Descending Order By {{sortBy}}', {sortBy: `${title}`})
        : _('Sorted In Ascending Order By {{sortBy}}', {sortBy: `${title}`});
    const Icon = currentSortDir === DESC ? ArrowDownIcon : ArrowUpIcon;
    return (
      <SortSymbol title={titleText}>
        &nbsp;
        <Icon color="var(--mantine-color-green-5)" />
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
