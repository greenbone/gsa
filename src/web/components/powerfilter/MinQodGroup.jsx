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

const MinQodGroup = ({qod, onChange, filter, name = 'min_qod'}) => {
  const [_] = useTranslation();

  if (!isDefined(qod) && isDefined(filter)) {
    qod = filter.get('min_qod');
  }
  return (
    <FormGroup direction="row" title={_('QoD')}>
      <span>{_('must be at least')}</span>
      <Spinner
        data-testid="min-qod"
        max="100"
        min="0"
        name={name}
        step="1"
        type="int"
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
