/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {is_array, is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

const convert_size = ({size = 'small'}) => {
  let width;
  let height;

  if (size === 'small') {
    height = width = '16px';
  }
  else if (size === 'medium') {
    height = width = '24px';
  }
  else if (size === 'large') {
    height = width = '50px';
  }
  else if (is_array(size)) {
    width = size[0];
    height = size[1];
  }

  return {
    '&, & *': {
      height,
      width,
    }
  };
};

const icon_button_css = {
  cursor: 'pointer',
  '@media print': {
    display: 'none',
  },
};

export const withIconCss = Component => {

  const IconCss = glamorous(Component)(
    {
      display: 'inline-block',
    },
    ({onClick}) => is_defined(onClick) ? 'icon icon-button' : 'icon',
    ({onClick}) => is_defined(onClick) ? icon_button_css : {},
    convert_size,
  );

  IconCss.propTypes = {
    size: PropTypes.iconSize,
    onClick: PropTypes.func,
  };

  return IconCss;
};

export default withIconCss;

// vim: set ts=2 sw=2 tw=80:
