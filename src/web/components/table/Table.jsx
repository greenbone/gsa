/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/PropTypes';

const Table = ({children, className, footer, header}) => {
  return (
    <table className={className}>
      {header}
      {children}
      {footer}
    </table>
  );
};

Table.propTypes = {
  className: PropTypes.string,
  fixed: PropTypes.bool,
  footer: PropTypes.element,
  header: PropTypes.element,
};

export default styled(Table)`
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
