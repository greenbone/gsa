/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import glamorous from 'glamorous';

import PropTypes from '../../utils/proptypes.js';

const StyledDiv = glamorous.div(
  {
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    flexGrow: '1',
    paddingLeft: '3px',
    paddingRight: '3px',
    paddingBottom: '1px',
    borderTop: 'white 2px solid',
  },
  ({active, disabled, theme}) => ({
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderTop: active ? '2px solid ' + theme.main.lightGreen : undefined,
    ':hover': {
      borderTop: active ? undefined : '2px solid' + theme.extra.lightGray,
    },
  }),
);

const Tab = ({
  isActive = false,
  children,
  disabled = false,
  onActivate,
}) => (
  <StyledDiv
    active={isActive}
    onClick={disabled ? undefined : onActivate}>
    {children}
  </StyledDiv>
);

Tab.propTypes = {
  disabled: PropTypes.bool,
  isActive: PropTypes.bool,
  onActivate: PropTypes.func,
};

export default Tab;

// vim: set ts=2 sw=2 tw=80:
