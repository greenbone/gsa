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

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

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
  width: COLUMNS[parseInt(titleSize) - 1],
  marginLeft: COLUMNS[parseInt(titleOffset) - 1],
}));

const FormGroupContent = glamorous(Layout)(
  ({size}) => isDefined(size) ? {
    width: COLUMNS[parseInt(size) - 1],
    paddingLeft: '10px',
    paddingRight: '10px',
  } : null,
  ({offset}) => isDefined(offset) ? {
    marginLeft: COLUMNS[parseInt(offset) - 1],
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

  if (isDefined(condition) && !condition) {
    return null;
  }

  if (title && !isDefined(size)) {
      size = 12 - titleSize - titleOffset;
  }

  return (
    <FormGroupLayout
      flex
      align={['start', 'center']}
    >
      {isDefined(title) &&
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
