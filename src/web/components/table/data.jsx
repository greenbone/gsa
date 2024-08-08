/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import Layout from '../layout/layout';

const TableData = ({children, className, colSpan, rowSpan, ...other}) => (
  <td className={className} colSpan={colSpan} rowSpan={rowSpan}>
    <Layout flex="column" {...other}>
      {children}
    </Layout>
  </td>
);

TableData.propTypes = {
  className: PropTypes.string,
  colSpan: PropTypes.numberOrNumberString,
  rowSpan: PropTypes.numberOrNumberString,
};

export const TableDataAlignTop = styled(TableData)`
  vertical-align: top;
`;

export default TableData;

// vim: set ts=2 sw=2 tw=80:
