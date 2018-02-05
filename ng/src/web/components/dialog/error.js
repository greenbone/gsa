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
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Theme from '../../utils/theme.js';

import Layout from '../layout/layout.js';

import CloseButton from './closebutton.js';

const StyledLayout = glamorous(Layout)({
  padding: '15px',
  margin: '20px 1em',
  border: '1px solid ' + Theme.mediumLightRed,
  borderRadius: '4px',
  color: Theme.darkRed,
  backgroundColor: Theme.lightRed,
});

const DialogCloseButton = glamorous(CloseButton)({
  border: '1px solid ' + Theme.lightRed,
  background: '0',
  color: Theme.darkRed,

  ':hover': {
    border: '1px solid ' + Theme.darkRed,
    background: '0',
    color: Theme.black,
    opacity: '.5',
  },
});

const DialogError = ({error, onCloseClick}) => {
  if (!is_defined(error)) {
    return null;
  }
  return (
    <StyledLayout
      align={['space-between', 'center']}>
      <span>{error}</span>
      <DialogCloseButton
        onClick={onCloseClick}
        title={_('Close')}/>
    </StyledLayout>
  );
};

DialogError.propTypes = {
  error: PropTypes.string,
  onCloseClick: PropTypes.func,
};

export default DialogError;

// vim: set ts=2 sw=2 tw=80:
