/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {parseInt} from 'gmp/parser';

import {isDefined} from 'gmp/utils/identity';

import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';

import PropTypes from 'web/utils/proptypes';

const ApplyOverridesGroup = ({
  filter,
  name = 'apply_overrides',
  overrides,
  onChange,
}) => {
  if (isDefined(filter)) {
    overrides = filter.get('apply_overrides');
  }
  return (
    <FormGroup title={_('Apply Overrides')}>
      <YesNoRadio
        value={overrides}
        name={name}
        yesValue={1}
        noValue={0}
        convert={parseInt}
        onChange={onChange}
      />
    </FormGroup>
  );
};

ApplyOverridesGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  overrides: PropTypes.number,
  onChange: PropTypes.func,
};

export default ApplyOverridesGroup;

// vim: set ts=2 sw=2 tw=80:
