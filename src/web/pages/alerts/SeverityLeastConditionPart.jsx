/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Radio from 'web/components/form/Radio';
import Spinner from 'web/components/form/Spinner';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import withPrefix from 'web/utils/withPrefix';

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
        checked={condition === VALUE}
        name="condition"
        title={_('Severity at least')}
        value={VALUE}
        onChange={onChange}
      />
      <Spinner
        min="0"
        name={prefix + 'severity'}
        type="float"
        value={severity}
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
