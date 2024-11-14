/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isString} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';

const FilterStringGroup = ({filter, onChange, name = 'filter'}) => {
  const filterstring = isString(filter)
    ? filter
    : filter.toFilterCriteriaString();
  return (
    <FormGroup title={_('Filter')}>
      <TextField
        name={name}
        grow="1"
        value={filterstring}
        size="30"
        onChange={onChange}
        data-testid="filter_textfield"
      />
    </FormGroup>
  );
};

FilterStringGroup.propTypes = {
  filter: PropTypes.oneOfType([PropTypes.string, PropTypes.filter]).isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterStringGroup;

// vim: set ts=2 sw=2 tw=80:

