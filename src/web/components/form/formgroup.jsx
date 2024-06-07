/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import Layout from 'web/components/layout/layout';
import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

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

const Title = styledExcludeProps(styled.label, ['titleSize', 'titleOffset'])`
  display: inline-block;
  max-width: 100%;
  font-weight: bold;
  text-align: right;
  padding-left: 10px;
  padding-right: 10px;
  width: ${props => COLUMNS[props.titleSize]};
  margin-left: ${props => COLUMNS[props.titleOffset]};
`;

const FormGroupContent = styledExcludeProps(styled(Layout), [
  'size',
  'offset',
  'paddingLeft',
])`
  ${props => {
    const ret = {};
    if (isDefined(props.size)) {
      ret.width = COLUMNS[parseInt(props.size)];
      ret.paddingLeft = isDefined(props.paddingLeft)
        ? props.paddingLeft
        : '10px';
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
  paddingLeft,
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
        paddingLeft={paddingLeft}
      >
        {children}
      </FormGroupContent>
    </FormGroupLayout>
  );
};

FormGroup.propTypes = {
  className: PropTypes.string,
  offset: PropTypes.numberOrNumberString,
  paddingLeft: PropTypes.numberOrNumberString,
  size: PropTypes.numberOrNumberString,
  title: PropTypes.string,
  titleOffset: PropTypes.numberOrNumberString,
  titleSize: PropTypes.numberOrNumberString,
};

export default FormGroup;

// vim: set ts=2 sw=2 tw=80:
