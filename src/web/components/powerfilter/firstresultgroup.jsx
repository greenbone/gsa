/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

const FirstResultGroup = ({first, filter, onChange, name = 'first'}) => {
  if (isDefined(filter)) {
    first = filter.get('first');
  }
  return (
    <FormGroup title={_('First result')}>
      <Spinner
        type="int"
        name={name}
        value={first}
        size="5"
        onChange={onChange}
      />
    </FormGroup>
  );
};

FirstResultGroup.propTypes = {
  filter: PropTypes.filter,
  first: PropTypes.number,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default FirstResultGroup;

// vim: set ts=2 sw=2 tw=80:
