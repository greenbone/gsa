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

import _ from '../../locale.js';

import Button from '../button.js';

export const DialogError = props => {
  if (!props.error) {
    return null;
  }
  return (
    <div className="dialog-error">
      <span className="dialog-error-text">{props.error}</span>
      <Button className="dialog-close-button"
        onClick={props.onCloseClick}
        title={_('Close')}>x</Button>
    </div>
  );
};

DialogError.propTypes = {
  error: React.PropTypes.string,
  onCloseClick: React.PropTypes.func,
};

export default DialogError;

// vim: set ts=2 sw=2 tw=80:
