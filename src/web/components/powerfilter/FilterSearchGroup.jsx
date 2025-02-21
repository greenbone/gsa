/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* this is experimental. trying to consolidate all filter terms whose
 * method should be ~'value' into one. */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import PropTypes from 'web/utils/PropTypes';

const FilterSearchGroup = ({name, filter, title, onChange}) => {
  let filterVal;

  if (!isDefined(filterVal) && isDefined(filter)) {
    filterVal = filter.get(name);
    if (isDefined(filterVal)) {
      if (filterVal.startsWith('"')) {
        filterVal = filterVal.slice(1);
      }
      if (filterVal.endsWith('"')) {
        filterVal = filterVal.slice(0, -1);
      }
    }
  }

  return (
    <FormGroup title={title}>
      <TextField name={name} value={filterVal} onChange={onChange} />
    </FormGroup>
  );
};

FilterSearchGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterSearchGroup;
