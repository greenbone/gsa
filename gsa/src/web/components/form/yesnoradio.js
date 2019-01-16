/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
      />
      <Radio
        title={_('No')}
        value={noValue}
        name={name}
        checked={value === noValue}
        convert={convert}
        onChange={onChange}
        disabled={disabled}
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
