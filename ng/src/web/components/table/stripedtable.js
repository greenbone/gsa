/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import Table from './table.js';

import glamorous from 'glamorous';

const StripedTable = glamorous(Table)({
  '& th, & td': {
    padding: '4px',
  },
  '& tfoot tr': {
    background: '#DDDDDD',
  },

  '@media screen': {
    ['& > tbody:nth-of-type(even), ' +
    '& > tbody:only-of-type > tr:nth-of-type(even)']: {
      backgroundColor: '#EEEEEE',
    },
    ['& > tbody:not(:only-of-type):hover, ' +
    '& > tbody:only-of-type > tr:hover']: {
      background: '#DDDDDD',
    },
  },
},
  ({doubleRow}) => {
    if (doubleRow) {
      return {
        // FIXME when details are toggled, coloring is scrambled up, due to
        // adding just one more tr and messing with the groups of two
        '@media screen': {
          // overwrite standard striped coloring
          ['& > tbody:nth-of-type(even), ' +
          '& > tbody:only-of-type > tr:nth-of-type(even)']: {
            background: '#FFFFFF',
          },
          // Think in groups of 4 and color every two rows identical
          ['& > tbody:nth-of-type(even), ' +
          '& > tbody:only-of-type > tr:nth-of-type(4n), ' +
          '& > tbody:only-of-type > tr:nth-of-type(4n-1)']: {
            background: '#EEEEEE',
          },
          ['& > tbody:not(:only-of-type):hover, ' +
          '& > tbody:only-of-type > tr:hover,' +
          '& > tbody:only-of-type > tr:hover + tr']: {
            background: '#DDDDDD',
          },
          // FIXME hovering groups don't fit when mouse over even rows
          ['& > tbody:only-of-type > tr:nth-of-type(even):hover,' +
          // the following does not work of course, but it should show
          // what is intended. "- tr" can't work, as html works from top to
          // bottom only
          '& > tbody:only-of-type > tr:nth-of-type(even):hover - tr']: {
            background: '#DDDDDD',
          },
        },
      };
    }
  }
);

export default StripedTable;

// vim: set ts=2 sw=2 tw=80:
