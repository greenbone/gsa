/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isString} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import TextField from 'web/components/form/TextField';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const FilterStringGroup = ({filter, onChange, name = 'filter'}) => {
  const [_] = useTranslation();
  const filterstring = isString(filter)
    ? filter
    : filter.toFilterCriteriaString();
  return (
    <FormGroup title={_('Filter')}>
      <TextField
        grow="1"
        name={name}
        size="30"
        value={filterstring}
        onChange={onChange}
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
