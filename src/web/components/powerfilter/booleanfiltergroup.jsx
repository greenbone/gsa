/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {parseInt} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';

const BooleanFilterGroup = ({filter, name, title, onChange}) => {
  let filterVal;

  if (isDefined(filter)) {
    filterVal = filter.get(name);
  }

  return (
    <FormGroup title={title}>
      <YesNoRadio
        value={filterVal}
        name={name}
        yesValue={1}
        noValue={0}
        convert={parseInt}
        onChange={onChange}
        data-testid="boolean-filter-yesnoradio"
      />
    </FormGroup>
  );
};

BooleanFilterGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default BooleanFilterGroup;

// vim: set ts=2 sw=2 tw=80:
