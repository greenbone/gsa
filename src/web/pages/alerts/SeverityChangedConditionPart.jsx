/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import withPrefix from 'web/utils/withPrefix';

const VALUE = 'Severity changed';

const SeverityChangedConditionPart = ({
  condition,
  direction,
  prefix,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        checked={condition === VALUE}
        name="condition"
        title={_('Severity Level')}
        value={VALUE}
        onChange={onChange}
      />
      <Select
        grow="1"
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
        name={prefix + 'direction'}
        value={direction}
        onChange={onChange}
      />
    </Row>
  );
};

SeverityChangedConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  direction: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(SeverityChangedConditionPart);
