/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isString} from 'gmp/utils/identity';
import React from 'react';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

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
