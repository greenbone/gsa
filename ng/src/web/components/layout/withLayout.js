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

import glamorous from 'glamorous';

import {is_defined, map} from 'gmp/utils.js';

const convert_align = align => {
  switch (align) {
    case 'end':
    case 'start':
      return 'flex-' + align;
    default:
      return align;
  }
};

const set_default_flex = defaults => is_defined(defaults.flex) ?
  defaults.flex : 'row';

const withLayout = (defaults = {}) => Component => {
  return glamorous(Component, {
    displayName: 'withLayout(' + Component.displayName + ')',
    filterProps: ['align', 'basis', 'flex', 'grow', 'shrink', 'wrap'],
    withProps: ({
      flex = set_default_flex(defaults),
    }) => ({className: flex === true ? 'layout-row' : 'layout-' + flex}),
  })(
    ({
      align = defaults.align,
      basis = defaults.basis,
      flex = set_default_flex(defaults),
      grow = defaults.grow,
      shrink = defaults.shrink,
      wrap = defaults.wrap,
    }) => {
      if (flex === true) {
        flex = 'row';
      }

      if (wrap === true) {
        wrap = 'wrap';
      }

      if (grow === true) {
        grow = 1;
      }

      if (is_defined(align)) {
        align = map(align, al => convert_align(al));
      }
      else { // use sane defaults for alignment
        align = flex === 'column' ? ['center', 'stretch'] : ['start', 'center'];
      }
      return {
        display: 'flex',
        flexDirection: flex,
        flexGrow: grow,
        flexBasis: basis,
        flexWrap: wrap,
        flexShrink: shrink,
        justifyContent: align[0],
        alignItems: align[1],
      };
    },
  );
};

export default withLayout;

// vim: set ts=2 sw=2 tw=80:
