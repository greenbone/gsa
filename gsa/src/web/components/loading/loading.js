/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {css} from 'glamor';

import Layout from '../../components/layout/layout.js';

const Loader = glamorous.div({
    border: '12px solid #c8d3d9',
    borderTop: '12px solid #66c430',
    borderRadius: '50%',
    width: '80px',
    height: '80px',
    animation: `${css.keyframes({
      '0%': {transform: `rotate(0deg)`},
      '100%': {transform: `rotate(360deg)`},
    })} 2s linear infinite`,
});

const StyledLayout = glamorous(Layout)({
  width: '100%',
});

const Loading = () => {
  return (
    <StyledLayout align={['center', 'center']}>
      <Loader/>
    </StyledLayout>
  );
};

export default Loading;

// vim: set ts=2 sw=2 tw=80:
