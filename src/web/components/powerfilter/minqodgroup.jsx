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

const MinQodGroup = ({qod, onChange, filter, name = 'min_qod'}) => {
  const [_] = useTranslation();

  if (!isDefined(qod) && isDefined(filter)) {
    qod = filter.get('min_qod');
  }
  return (
    <FormGroup title={_('QoD')} direction="row">
      <span>{_('must be at least')}</span>
      <Spinner
        type="int"
        name={name}
        min="0"
        max="100"
        step="1"
        value={qod}
        onChange={onChange}
      />
      <span>%</span>
    </FormGroup>
  );
};

MinQodGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  qod: PropTypes.number,
  onChange: PropTypes.func,
};

export default MinQodGroup;

// vim: set ts=2 sw=2 tw=80:
