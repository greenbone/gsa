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

import {is_defined, classes} from '../../utils.js';

import {withLayout} from '../layout.js';

import './css/form.css';
import './css/formgroup.css';

export const FormGroupContainer = props => {
  if (is_defined(props.condition) && !props.condition) {
    return null;
  }

  let {title, size, className} = props;

  className = classes('form-group', className);

  if (title) {
    let title_css = classes('col-' + props.titleSize, 'control-label');
    if (props.titleOffset) {
      title_css = classes('offset-' + props.titleOffset, title_css);
    }

    if (!is_defined(size)) {
      size = 12 - props.titleSize - props.titleOffset;
    }
    title = <label className={title_css}>{title}</label>;
  }

  let css = is_defined(size) ? 'col-' + size : '';

  if (props.offset) {
    css = classes('offset-' + props.offset, css);
  }
  return (
    <div className={className}>
      {title}
      <div className={css}>
        {props.children}
      </div>
    </div>
  );
};

FormGroupContainer.propTypes = {
  title: React.PropTypes.string,
  className: React.PropTypes.string,
  condition: React.PropTypes.bool,
  size: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  offset: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  titleSize: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
  titleOffset: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
  ]),
};

FormGroupContainer.defaultProps = {
  titleSize: 2,
  titleOffset: 0,
};

export const FormGroup = withLayout(FormGroupContainer,
  {align: ['start', 'center']});

export default FormGroup;

// vim: set ts=2 sw=2 tw=80:
