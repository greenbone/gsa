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

import {is_defined, classes} from 'gmp/utils.js';

import Layout from '../layout/layout';
import PropTypes from '../../utils/proptypes.js';

import './css/form.css';
import './css/formgroup.css';

const FormGroup = ({
    children,
    className,
    condition,
    flex = 'row',
    offset,
    size,
    title,
    titleOffset = 0,
    titleSize = 2,
    ...other
  }) => {

  if (is_defined(condition) && !condition) {
    return null;
  }

  className = classes('form-group', className);

  if (title) {
    let title_css = classes('col-' + titleSize, 'control-label');
    if (titleOffset) {
      title_css = classes('offset-' + titleOffset, title_css);
    }

    if (!is_defined(size)) {
      size = 12 - titleSize - titleOffset;
    }
    title = <label className={title_css}>{title}</label>;
  }

  let css = is_defined(size) ? 'col-' + size : '';

  if (offset) {
    css = classes('offset-' + offset, css);
  }
  return (
    <Layout
      flex
      align={['start', 'center']}
      className={className}>
      {title}
      <Layout
        {...other}
        flex={flex}
        className={css}>
        {children}
      </Layout>
    </Layout>
  );
};

FormGroup.propTypes = {
  className: PropTypes.string,
  condition: PropTypes.bool,
  flex: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  offset: PropTypes.numberOrNumberString,
  size: PropTypes.numberOrNumberString,
  title: PropTypes.string,
  titleOffset: PropTypes.numberOrNumberString,
  titleSize: PropTypes.numberOrNumberString,
};

export default FormGroup;

// vim: set ts=2 sw=2 tw=80:
