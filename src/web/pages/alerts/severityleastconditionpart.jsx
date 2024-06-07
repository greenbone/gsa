/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import Spinner from 'web/components/form/spinner';
import Radio from 'web/components/form/radio';

const VALUE = 'Severity at least';

const SeverityLeastConditionPart = ({
  condition,
  severity,
  prefix,
  onChange,
}) => {
  return (
    <Divider>
      <Radio
        title={_('Severity at least')}
        value={VALUE}
        checked={condition === VALUE}
        name="condition"
        onChange={onChange}
      />
      <Spinner
        value={severity}
        name={prefix + 'severity'}
        type="float"
        min="0"
        size="5"
        onChange={onChange}
      />
    </Divider>
  );
};

SeverityLeastConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  severity: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

export default withPrefix(SeverityLeastConditionPart);

// vim: set ts=2 sw=2 tw=80:
