/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


/* eslint-disable react/prop-types */
import React from 'react';

import Select from 'web/components/form/select';

import useTranslation from 'web/hooks/useTranslation';

import PropTypes from 'web/utils/proptypes';
import {UNSET_LABEL, UNSET_VALUE} from 'web/utils/render';

const RelationSelector = ({relation, onChange}) => {
  const [_] = useTranslation();
  return (
    <Select
      data-testid="relationselector"
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
