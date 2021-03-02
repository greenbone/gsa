/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import withLayout from 'web/components/layout/withLayout';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

import withClickHandler from './withClickHandler';

const StyledButton = styled.button`
  display: inline-block;
  padding: 0 15px;
  color: ${Theme.darkGray};
  text-align: center;
  vertical-align: middle;
  font-size: 11px;
  font-weight: bold;
  line-height: 30px;
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
    background: ${Theme.green};
    font-weight: bold;
    color: ${Theme.white};
  }
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.65;
    box-shadow: none;
  }
  & img {
    height: 32px;
    width: 32px;
    margin-top: 5px 10px 5px -10px;
    vertical-align: middle;
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
  withClickHandler(),
)(Button);

// vim: set ts=2 sw=2 tw=80:
