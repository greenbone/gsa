/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import glamorous from 'glamorous';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

const icon_button_css = {
  cursor: 'pointer',
  '@media print': {
    display: 'none',
  },
};

export const withIconCss = Component => {

  const IconCss = glamorous(Component, {displayName: 'IconCss'})(
    {
      display: 'inline-block',
    },
    ({onClick}) => isDefined(onClick) ? 'icon icon-button' : 'icon',
    ({onClick}) => isDefined(onClick) ? icon_button_css : {},
  );

  IconCss.propTypes = {
    onClick: PropTypes.func,
  };

  return IconCss;
};

export default withIconCss;

// vim: set ts=2 sw=2 tw=80:
