/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {is_defined} from 'gmp/utils';
import {parse_int} from 'gmp/parser';

import Layout from '../layout/layout';
import PropTypes from '../../utils/proptypes.js';

const COLUMNS = [
  '8.33333333%',
  '16.66666667%',
  '25%',
  '33.33333333%',
  '41.66666667%',
  '50%',
  '58.33333333%',
  '66.66666667%',
  '75%',
  '83.33333333%',
  '91.66666667%',
  '100%',
];

const FormGroupLayout = glamorous(Layout)({
  paddingBottom: '10px',
});

const Title = glamorous.label({
  display: 'inline-block',
  maxWidth: '100%',
  fontWeight: 'bold',
  textAlign: 'right',
  paddingLeft: '10px',
  paddingRight: '10px',
}, ({titleOffset, titleSize}) => ({
  width: COLUMNS[parse_int(titleSize) - 1],
  marginLeft: COLUMNS[parse_int(titleOffset) - 1],
}));

const FormGroupContent = glamorous(Layout)(
  ({size}) => is_defined(size) ? {
  width: COLUMNS[parse_int(size) - 1],
  paddingLeft: '10px',
  paddingRight: '10px',
} : null,
  ({offset}) => is_defined(offset) ? {
    marginLeft: COLUMNS[parse_int(offset) - 1],
  } : null,
);

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

  if (title && !is_defined(size)) {
      size = 12 - titleSize - titleOffset;
  }

  return (
    <FormGroupLayout
      flex
      align={['start', 'center']}
      className={className}
      >
      {is_defined(title) &&
        <Title
          titleOffset={titleOffset}
          titleSize={titleSize}
        >
          {title}
        </Title>
      }
      <FormGroupContent
        {...other}
        flex={flex}
        offset={offset}
        size={size}
        >
        {children}
      </FormGroupContent>
    </FormGroupLayout>
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
