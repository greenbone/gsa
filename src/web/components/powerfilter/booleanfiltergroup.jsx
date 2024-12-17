/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import FormGroup from 'web/components/form/formgroup';
import YesNoRadio from 'web/components/form/yesnoradio';
import PropTypes from 'web/utils/proptypes';

const BooleanFilterGroup = ({filter, name, title, onChange}) => {
  let filterVal;

  if (isDefined(filter)) {
    filterVal = filter.get(name);
  }

  return (
    <FormGroup title={title}>
      <YesNoRadio
        convert={parseInt}
        data-testid="boolean-filter-yesnoradio"
        name={name}
        noValue={0}
        value={filterVal}
        yesValue={1}
        onChange={onChange}
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
