/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import Radio from 'web/components/form/radio';

const VALUE = 'Severity changed';

const SeverityChangedConditionPart = ({
  condition,
  direction,
  prefix,
  onChange,
}) => {
  return (
    <Divider>
      <Radio
        title={_('Severity Level')}
        value={VALUE}
        name="condition"
        checked={condition === VALUE}
        onChange={onChange}
      />
      <Select
        items={[
          {
            value: 'changed',
            label: _('changed'),
          },
          {
            value: 'increased',
            label: _('increased'),
          },
          {
            value: 'decreased',
            label: _('decreased'),
          },
        ]}
        value={direction}
        name={prefix + 'direction'}
        onChange={onChange}
      />
    </Divider>
  );
};

SeverityChangedConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(SeverityChangedConditionPart);

// vim: set ts=2 sw=2 tw=80:
