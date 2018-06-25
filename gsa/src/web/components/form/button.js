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

import React from 'react';

import glamorous from 'glamorous';

import compose from '../../utils/compose.js';

import withLayout from '../layout/withLayout.js';

import withClickHandler from './withClickHandler.js';

const Button = glamorous(({
  title,
  children = title,
  ...other
}) => (
  <button
    {...other}
    title={title}
  >
    {children}
  </button>
), {
  rootEl: 'button',
})({
  display: 'inline-block',
  padding: '0 15px',
  color: '#555',
  textAlign: 'center',
  verticalAlign: 'middle',
  fontSize: '11px',
  fontWeight: 'bold',
  lineHeight: '30px',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  backgroundColor: '#fff',
  borderRadius: '4px',
  border: '1px solid #bbb',
  cursor: 'pointer',
  overflow: 'visible',
  '&:focus, &:hover': {
    border: '1px solid #519032',
  },
  '&:hover': {
    textDecoration: 'none',
    background: '#519032',
    fontWeight: 'bold',
    color: '#fff',
  },
  '&[disabled]': {
    cursor: 'not-allowed',
    opacity: '0.65',
    filter: 'alpha(opacity=65)',
    boxShadow: 'none',
  },
  '& img': {
    height: '32px',
    width: '32px',
    marginTop: '5px',
    marginBottom: '5px',
    marginRight: '10px',
    marginLeft: '-10px',
    verticalAlign: 'middle',
  },
  '&:link': {
    textDecoration: 'none',
    color: '#555',
  },
});

export default compose(
  withLayout({align: ['center', 'center']}),
  withClickHandler(),
)(Button);

// vim: set ts=2 sw=2 tw=80:
