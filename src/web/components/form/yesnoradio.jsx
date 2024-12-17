/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import React from 'react';
import Row from 'web/components/layout/row';
import PropTypes from 'web/utils/proptypes';

import Radio from './radio';

const YesNoRadio = ({
  convert = parseYesNo,
  disabled,
  value,
  name,
  yesValue = YES_VALUE,
  noValue = NO_VALUE,
  onChange,
}) => (
  <Row>
    <Radio
      checked={value === yesValue}
      convert={convert}
      data-testid="radio-yes"
      disabled={disabled}
      name={name}
      title={_('Yes')}
      value={yesValue}
      onChange={onChange}
    />
    <Radio
      checked={value === noValue}
      convert={convert}
      data-testid="radio-no"
      disabled={disabled}
      name={name}
      title={_('No')}
      value={noValue}
      onChange={onChange}
    />
  </Row>
);

YesNoRadio.propTypes = {
  convert: PropTypes.func,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  noValue: PropTypes.any,
  value: PropTypes.any,
  yesValue: PropTypes.any,
  onChange: PropTypes.func,
};

export default YesNoRadio;
