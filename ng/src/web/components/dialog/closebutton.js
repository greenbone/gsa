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

import _ from 'gmp/locale.js';

import Button from './button.js';
import PropTypes from '../../utils/proptypes';

const StyledCloseButton = glamorous(Button)({
  background: 'none',
  opacity: '.7',
  height: '20px',
  width: '20px',
  lineHeight: '0',
  padding: '0',
});

const CloseButton = ({
  title = _('Close'),
  onClick,
}) => (
  <StyledCloseButton
    onClick={onClick}
    title={title}
  >
    x
  </StyledCloseButton>
);

CloseButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

export default CloseButton;

// vim: set ts=2 sw=2 tw=80:
