/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

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

export default styledExcludeProps(styled(Table), ['fixed', 'size'])`
  border: 0;
  border-spacing: 0px;
  font-size: 12px;
  text-align: left;
  table-layout: ${props => (props.fixed ? 'fixed' : 'auto')};
  ${props => {
    const {size = 'full'} = props;
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

// vim: set ts=2 sw=2 tw=80:
