/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import Radio from 'web/components/form/radio';

const VALUE = 'Filter count changed';

const FilterCountChangedConditionPart = ({
  condition,
  count,
  filterId,
  filters,
  prefix,
  onChange,
}) => {
  return (
    <Divider>
      <Radio
        title={_('Filter')}
        value={VALUE}
        checked={condition === VALUE}
        name="condition"
        onChange={onChange}
      />
      <Select
        value={filterId}
        name={prefix + 'filter_id'}
        items={renderSelectItems(filters)}
        onChange={onChange}
      />
      <Layout>{_('matches at least')}</Layout>
      <Spinner
        value={count}
        name={prefix + 'count'}
        type="int"
        min="0"
        size="5"
        onChange={onChange}
      />
      <Layout>{_('result(s) more than previous scan')}</Layout>
    </Divider>
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
