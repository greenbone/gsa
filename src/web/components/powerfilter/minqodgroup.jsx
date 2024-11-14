/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from '../form/formgroup';
import Spinner from '../form/spinner';

import Divider from '../layout/divider';

const MinQodGroup = ({qod, onChange, filter, name = 'min_qod'}) => {
  if (!isDefined(qod) && isDefined(filter)) {
    qod = filter.get('min_qod');
  }
  return (
    <FormGroup title={_('QoD')}>
      <Divider>
        <span>{_('must be at least')}</span>
        <Spinner
          type="int"
          name={name}
          min="0"
          max="100"
          step="1"
          value={qod}
          size="1"
          onChange={onChange}
          data-testid="qod_filter"
        />
        <span>%</span>
      </Divider>
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
