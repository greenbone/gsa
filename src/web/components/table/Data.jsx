/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';

const TableData = ({children, className, colSpan, rowSpan, ...other}) => (
  <td className={className} colSpan={colSpan} rowSpan={rowSpan}>
    <StyledLayout flex="column" {...other}>
      {children}
    </StyledLayout>
  </td>
);

TableData.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  colSpan: PropTypes.numberOrNumberString,
  rowSpan: PropTypes.numberOrNumberString,
};

const StyledLayout = styled(Layout)`
  padding-top: 8px;
  padding-bottom: 8px;
`;

export const TableDataAlignTop = styled(TableData)`
  vertical-align: top;
`;

export default TableData;
