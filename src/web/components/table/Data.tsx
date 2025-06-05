/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout, {LayoutProps} from 'web/components/layout/Layout';

interface TableDataProps extends LayoutProps {
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}

const TableData = ({
  children,
  className,
  colSpan,
  rowSpan,
  ...other
}: TableDataProps) => (
  <td className={className} colSpan={colSpan} rowSpan={rowSpan}>
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
