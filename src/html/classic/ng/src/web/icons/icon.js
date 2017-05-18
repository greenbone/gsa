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

import {classes, is_array} from '../../utils.js';

import PropTypes from '../proptypes.js';
import {get_img_url} from '../urls.js';

import './css/icon.css';

export const withIconCss = Component => {
  function IconCss({size = 'small', className, style = {}, onClick, ...other}) {
    if (size === 'small') {
      className = classes('icon', 'icon-sm', className);
    }
    else if (size === 'medium') {
      className = classes('icon', 'icon-m', className);
    }
    else if (size === 'large') {
      className = classes('icon', 'icon-lg', className);
    }
    else if (is_array(size)) {
      style.width = size[0];
      style.height = size[1];
    }
    else {
      className = classes('icon', className);
    }

    if (onClick) {
      className = classes(className, 'icon-button');
    }
    return (
      <Component
        {...other}
        style={style}
        className={className}
        onClick={onClick}
      />
    );
  };

  IconCss.propTypes = {
    className: PropTypes.string,
    size: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.oneOf([
        'small', 'medium', 'large', 'default',
      ]),
    ]),
    style: PropTypes.object,
    onClick: PropTypes.func,
  };

  return IconCss;
};

class IconComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    let {value, onClick} = this.props;

    if (onClick) {
      onClick(value);
    }
  }

  render() {
    const {img, href, alt = '', value, onClick, ...other} = this.props; // eslint-disable-line no-unused-vars
    let img_path = get_img_url(img);

    if (href) {
      return (
        <a
          {...other}
          href={href}
          onClick={this.handleClick}
        >
          <img src={img_path} alt={alt}/>
        </a>
      );
    }
    return (
      <img
        {...other}
        alt={alt}
        src={img_path}
        onClick={this.handleClick}
      />
    );
  }
}

IconComponent.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  href: PropTypes.string,
  img: PropTypes.string.isRequired,
  size: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
};

export default withIconCss(IconComponent);

// vim: set ts=2 sw=2 tw=80:
