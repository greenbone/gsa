/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {classes} from '../utils.js';

import './css/icon.css';

export const Icon = props => {
  const {img, href, size = 'small', className, onClick, alt = '',
    ...other} = props;
  let css = 'icon';

  if (size === 'small') {
    css = classes('icon', 'icon-sm', className);
  }
  else if (size === 'medium') {
    css = classes('icon', 'icon-m', className);
  }
  else if (size === 'large') {
    css = classes('icon', 'icon-lg', className);
  }
  else {
    css = classes('icon', className);
  }

  if (onClick) {
   css = classes(css, 'icon-button');
  }

  let img_path = process.env.PUBLIC_URL + '/img/' + img; // eslint-disable-line no-process-env,no-undef

  if (href) {
    return (
      <a onClick={onClick} {...other} className={css} href={href}>
        <img src={img_path} alt={alt}/>
      </a>
    );
  }
  return (
    <img onClick={onClick} {...other} alt={alt} className={css}
      src={img_path}/>
  );
};

Icon.propTypes = {
  alt: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
  size: React.PropTypes.string,
  href: React.PropTypes.string,
  className: React.PropTypes.string,
  onClick: React.PropTypes.func,
};

export default Icon;

// vim: set ts=2 sw=2 tw=80:
