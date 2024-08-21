/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';

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
