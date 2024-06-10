/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


/* eslint-disable react/prop-types */
import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/render';

import Select from 'web/components/form/select';

const RelationSelector = ({relation, onChange}) => {
  return (
    <Select
      value={relation}
      onChange={onChange}
      items={[
        {label: UNSET_LABEL, value: UNSET_VALUE},
        {label: _('is equal to'), value: '='},
        {label: _('is greater than'), value: '>'},
        {label: _('is less than'), value: '<'},
      ]}
    />
  );
};

RelationSelector.propTypes = {
  relation: PropTypes.string,
  onChange: PropTypes.func,
};

export default RelationSelector;
