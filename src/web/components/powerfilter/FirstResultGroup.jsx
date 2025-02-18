/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import FormGroup from 'web/components/form/FormGroup';
import Spinner from 'web/components/form/Spinner';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const FirstResultGroup = ({first, filter, onChange, name = 'first'}) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    first = filter.get('first');
  }
  return (
    <FormGroup title={_('First result')}>
      <Spinner
        min="0"
        name={name}
        type="int"
        value={first}
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
