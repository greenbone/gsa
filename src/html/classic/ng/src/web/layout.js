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

import {classes, is_defined, is_empty, is_array} from '../utils.js';

import './css/layout.css';

const LAYOUT_PROPNAMES = [
  'flex', 'align', 'grow', 'shrink', 'basis', 'float',
];

export const withLayout = (Component, defaults) => {
  return function(props) {
    let {className, flex, align, grow, shrink, basis, float, ...other} = props; // eslint-disable-line
    let css = className;
    let style = {};


    if (is_defined(flex)) {
      if (is_empty(flex) || flex === true) {
        flex = 'row';
      }
      css = classes('flex', flex, css);

      if (!is_defined(align) && is_defined(defaults)) {
        align = defaults.align;
      }

      if (is_defined(align)) {
        if (is_array(align)) {
          css = classes('justify-' + align[0], 'align-' + align[1], css);
        }
        else {
          css = classes('justify-' + align, css);
        }
      }
    }
    else if (is_defined(float)) {
      css = classes('float', css);
    }

    if (is_defined(grow)) {
      style.flexGrow = grow;
    }
    if (is_defined(shrink)) {
      style.flexShring = shrink;
    }
    if (is_defined(basis)) {
      style.flexBasis = basis;
    }

    return <Component {...other} className={css} style={style}/>;
  };
};

const LayoutContainer = props => {
  return (
    <div {...props}/>
  );
};

LayoutContainer.propTypes = {
  className: React.PropTypes.string,
  flex: React.PropTypes.oneOf(['row', 'column', true]),
  float: React.PropTypes.bool,
  align: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array,
  ]),
  grow: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  shrink: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  basis: React.PropTypes.string,
};

export const get_layout_props = props => {
  let values = {};

  if (!is_defined(props)) {
    return values;
  }

  for (let name of LAYOUT_PROPNAMES) {
    if (props.hasOwnProperty(name)) {
      values[name] = props[name];
    }
  }

  return values;
};

export const Layout = withLayout(LayoutContainer);

export default Layout;

// vim: set ts=2 sw=2 tw=80:
