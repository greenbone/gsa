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

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';

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

const FormGroupLayout = styled(Layout)`
  padding-bottom: 10px;
`;

const Title = styled.label`
  display: inline-block;
  max-width: 100%;
  font-weight: bold;
  text-align: right;
  padding-left: 10px;
  padding-right: 10px;
  width: ${props => COLUMNS[parseInt(props.titleSize) - 1]};
  margin-left: ${props => COLUMNS[parseInt(props.titleOffset) - 1]};
`;

const FormGroupContent = styled(Layout)`
  ${props => {
    const ret = {};
    if (isDefined(props.size)) {
      ret.width = COLUMNS[parseInt(props.size) - 1];
      ret.paddingLeft = '10px';
      ret.paddingRight = '10px';
    }
    if (isDefined(props.offset)) {
      ret.marginLeft = COLUMNS[parseInt(props.offset) - 1];
    }
    return ret;
  }}
`;

const FormGroup = ({
  children,
  className,
  flex = 'row',
  offset,
  size,
  title,
  titleOffset = 0,
  titleSize = 2,
  ...other
}) => {
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
