/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import Layout from 'web/components/layout/layout';
import Row from 'web/components/layout/row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

const VALUE = 'Filter count changed';

const FilterCountChangedConditionPart = ({
  condition,
  count,
  filterId,
  filters,
  prefix,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <Row>
      <Radio
        checked={condition === VALUE}
        name="condition"
        title={_('Filter')}
        value={VALUE}
        onChange={onChange}
      />
      <Select
        items={renderSelectItems(filters)}
        name={prefix + 'filter_id'}
        value={filterId}
        onChange={onChange}
      />
      <Layout>{_('matches at least')}</Layout>
      <Spinner
        min="0"
        name={prefix + 'count'}
        type="int"
        value={count}
        onChange={onChange}
      />
      <Layout>{_('result(s) more than previous scan')}</Layout>
    </Row>
  );
};

FilterCountChangedConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  filterId: PropTypes.id,
  filters: PropTypes.array.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(FilterCountChangedConditionPart);

// vim: set ts=2 sw=2 tw=80:
