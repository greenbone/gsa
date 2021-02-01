/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

const COLUMNS = [
  '0',
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

const FormGroupLayout = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  padding-bottom: 10px;
`;

const Title = styled.label`
  display: inline-block;
  max-width: 100%;
  font-weight: bold;
  text-align: right;
  padding-left: 10px;
  padding-right: 10px;
  width: ${props => COLUMNS[props.titleSize]};
  margin-left: ${props => COLUMNS[props.titleOffset]};
`;

const FormGroupContent = styled(Layout)`
  ${props => {
    const ret = {};
    if (isDefined(props.size)) {
      ret.width = COLUMNS[parseInt(props.size)];
      ret.paddingLeft = '10px';
      ret.paddingRight = '10px';
    }
    if (isDefined(props.offset)) {
      ret.marginLeft = COLUMNS[parseInt(props.offset)];
    }
    return ret;
  }}
`;

const FormGroup = ({
  children,
  className,
  offset,
  size,
  title,
  titleOffset = 0,
  titleSize = 2,
  ...other
}) => {
  titleOffset = parseInt(titleOffset);
  titleSize = parseInt(titleSize);

  if (title && !isDefined(size)) {
    size = 12 - titleSize - titleOffset;
  }
  return (
    <FormGroupLayout>
      {isDefined(title) && (
        <Title
          data-testid="formgroup-title"
          titleOffset={titleOffset}
          titleSize={titleSize}
        >
          {title}
        </Title>
      )}
      <FormGroupContent
        data-testid="formgroup-content"
        {...other}
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
  offset: PropTypes.numberOrNumberString,
  size: PropTypes.numberOrNumberString,
  title: PropTypes.string,
  titleOffset: PropTypes.numberOrNumberString,
  titleSize: PropTypes.numberOrNumberString,
};

export default FormGroup;

// vim: set ts=2 sw=2 tw=80:
