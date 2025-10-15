/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Layout, {type LayoutProps} from 'web/components/layout/Layout';

interface TableDataProps extends LayoutProps {
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}

const TableData = ({
  children,
  className,
  'data-testid': dataTestId,
  colSpan,
  rowSpan,
  ...other
}: TableDataProps) => (
  <td
    className={className}
    colSpan={colSpan}
    data-testid={dataTestId}
    rowSpan={rowSpan}
  >
    <StyledLayout flex="column" {...other}>
      {children}
    </StyledLayout>
  </td>
);

const StyledLayout = styled(Layout)`
  padding-top: 8px;
  padding-bottom: 8px;
`;

export const TableDataAlignTop = styled(TableData)`
  vertical-align: top;
`;

export default TableData;
