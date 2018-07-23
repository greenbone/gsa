/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import Theme from '../../utils/theme.js';

import PropTypes from '../../utils/proptypes.js';

const StyledDiv = glamorous.div(
  {
    fontSize: '16px',
    display: 'flex',
    alignItems: 'start',
    flexGrow: '1',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingBottom: '2px',
    paddingTop: '2px',
  },
  ({active, disabled}) => ({
    borderLeft: active ?
      '1px solid ' + Theme.dialogGray : '1px solid ' + Theme.white,
    borderRight: '1px solid ' + Theme.lightGray,
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: active ? Theme.dialogGray : undefined,
    borderBottom: active ? '1px solid ' + Theme.dialogGray : undefined,
    marginBottom: active ? '-1px' : undefined,
    borderTop: active ?
      '2px solid ' + Theme.lightGreen :
      '2px solid ' + Theme.white,
    ':hover': {
      borderTop: active ?
        undefined : '2px solid ' + Theme.lightGray,
    },
    ':first-child': {
      borderLeft: active ?
        '1px solid ' + Theme.lightGray : '1px solid ' + Theme.white,
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
    onClick={disabled ? undefined : onActivate}
  >
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
