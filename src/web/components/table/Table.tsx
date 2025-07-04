/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';

interface TableProps {
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

const Table = ({children, className, footer, header}: TableProps) => {
  return (
    <table className={className}>
      {header}
      {children}
      {footer}
    </table>
  );
};

interface StyledTableProps {
  $fixed?: boolean;
  $size?: string;
}

export default styled(Table)<StyledTableProps>`
  border: 0;
  border-spacing: 0px;
  text-align: left;

  table-layout: ${props => (props.$fixed ? 'fixed' : 'auto')};
  ${props => {
    const size = props.$size || 'full';
    if (size === 'auto') {
      return {};
    }
    if (size === 'full') {
      return {
        width: '100%',
      };
    }
    return {
      width: size,
    };
  }};
  @media print {
    border-collapse: collapse;
  }
`;
