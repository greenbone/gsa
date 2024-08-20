/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Spinner from 'web/components/form/spinner';

import useTranslation from 'web/hooks/useTranslation';

const FirstResultGroup = ({first, filter, onChange, name = 'first'}) => {
  const [_] = useTranslation();

  if (isDefined(filter)) {
    first = filter.get('first');
  }
  return (
    <FormGroup title={_('First result')}>
      <Spinner
        type="int"
        min="0"
        name={name}
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
