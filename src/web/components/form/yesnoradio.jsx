/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Radio from './radio';

const YesNoRadio = ({
  convert = parseYesNo,
  disabled,
  value,
  name,
  yesValue = YES_VALUE,
  noValue = NO_VALUE,
  onChange,
  ...other
}) => (
  <Layout {...other}>
    <Divider>
      <Radio
        title={_('Yes')}
        value={yesValue}
        name={name}
        checked={value === yesValue}
        convert={convert}
        onChange={onChange}
        disabled={disabled}
        data-testid="yes_radio"
      />
      <Radio
        title={_('No')}
        value={noValue}
        name={name}
        checked={value === noValue}
        convert={convert}
        onChange={onChange}
        disabled={disabled}
        data-testid="no_radio"
      />
    </Divider>
  </Layout>
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

// vim: set ts=2 sw=2 tw=80:
