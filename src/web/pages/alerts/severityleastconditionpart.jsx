/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Row from 'web/components/layout/row';

import PropTypes from 'web/utils/proptypes';
import withPrefix from 'web/utils/withPrefix';

import Spinner from 'web/components/form/spinner';
import Radio from 'web/components/form/radio';

import useTranslation from 'web/hooks/useTranslation';

const VALUE = 'Severity at least';

const SeverityLeastConditionPart = ({
  condition,
  severity,
  prefix,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <Row>
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
        onChange={onChange}
      />
    </Row>
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
