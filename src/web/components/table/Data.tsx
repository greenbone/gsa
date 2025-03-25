/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import {LayoutProps} from 'web/components/layout/withLayout';

interface TableDataProps extends LayoutProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}

const TableData: React.FC<TableDataProps> = ({
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
