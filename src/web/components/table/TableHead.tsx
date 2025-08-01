/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import {ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon} from 'web/components/icon';
import Layout, {LayoutProps} from 'web/components/layout/Layout';
import SortBy from 'web/components/sortby/SortBy';
import useTranslation from 'web/hooks/useTranslation';
import SortDirection, {SortDirectionType} from 'web/utils/SortDirection';
import Theme from 'web/utils/Theme';

interface ToString {
  toString: () => string;
}

interface TableHeadProps extends Omit<LayoutProps, 'title'> {
  className?: string;
  colSpan?: number;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  rowSpan?: number;
  sort?: boolean;
  sortBy?: string;
  title?: ToString;
  width?: string;
  withBorder?: boolean;
  onSortChange?: (sortBy: string) => void;
}

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
  withBorder = true,
  onSortChange,
  ...other
}: TableHeadProps) => {
  const [_] = useTranslation();
  const getSortSymbol = () => {
    if (sort && currentSortBy !== sortBy) {
      return (
        <SortSymbol title={_('Not Sorted')}>
          &nbsp;
          <ArrowUpDownIcon />
        </SortSymbol>
      );
    }
    const titleText =
      currentSortDir === SortDirection.DESC
        ? _('Sorted In Descending Order By {{sortBy}}', {sortBy: String(title)})
        : _('Sorted In Ascending Order By {{sortBy}}', {sortBy: String(title)});
    const Icon =
      currentSortDir === SortDirection.DESC ? ArrowDownIcon : ArrowUpIcon;
    return (
      <SortSymbol title={titleText}>
        &nbsp;
        <Icon color="var(--mantine-color-green-5)" />
      </SortSymbol>
    );
  };

  if (isDefined(title) && !isDefined(children)) {
    children = String(title);
  }

  return (
    <th className={className} colSpan={colSpan} rowSpan={rowSpan}>
      {sort && isDefined(sortBy) ? (
        <SortBy
          by={sortBy}
          data-testid={`table-header-sort-by-${sortBy}`}
          onClick={onSortChange}
        >
          <Layout {...other}>
            {children}
            {getSortSymbol()}
          </Layout>
        </SortBy>
      ) : (
        <Layout {...other}>{children}</Layout>
      )}
    </th>
  );
};

export default styled(TableHead)`
  background-color: ${Theme.white};
  color: ${Theme.black};
  border-top: ${props =>
    props.withBorder ? `1px solid ${Theme.lightGray}` : 'none'};
  font-weight: bold;
  width: ${props => props.width};

  @media print {
    color: ${Theme.black};
    font-size: 1.2em;
    background-color: transparent;
    font-weight: bold;
  }
`;
