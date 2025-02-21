/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import withLayout from 'web/components/layout/withLayout';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const StyledButton = styled.button`
  display: inline-block;
  padding: 5px 7px;
  margin-top: -5px;
  color: ${Theme.darkGray};
  text-align: center;
  vertical-align: middle;
  font-size: 11px;
  font-weight: bold;
  text-decoration: none;
  white-space: nowrap;
  background-color: ${Theme.white};
  border-radius: 2px;
  border: 1px solid ${Theme.inputBorderGray};
  cursor: pointer;
  overflow: visible;
  z-index: ${Theme.Layers.higher}; /* Don't interfere with dialog resizer */
  &:focus,
  &:hover {
    border: 1px solid ${Theme.darkGray};
  }
  &:hover {
    text-decoration: none;
    background: ${Theme.mediumBlue};
    font-weight: bold;
    color: ${Theme.white};
  }
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.65;
    box-shadow: none;
  }
  &:link {
    text-decoration: none;
    color: ${Theme.darkGray};
  }
`;

const Button = ({title, children = title, ...other}) => (
  <StyledButton {...other} title={title}>
    {children}
  </StyledButton>
);

Button.propTypes = {
  title: PropTypes.string,
};

export default compose(
  withLayout({align: ['center', 'center']}),
  // withClickHandler(),
)(Button);
