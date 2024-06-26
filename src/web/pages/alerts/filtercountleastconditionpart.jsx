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

const VALUE = 'Filter count at least';

const FilterCountLeastConditionPart = ({
  condition,
  atLeastFilterId,
  atLeastCount,
  filters,
  prefix,
  onChange,
}) => {
  return (
    <Divider>
      <Radio
        title={_('Filter')}
        value={VALUE}
        name="condition"
        checked={condition === VALUE}
        onChange={onChange}
      />
      <Select
        value={atLeastFilterId}
        name={prefix + 'at_least_filter_id'}
        items={renderSelectItems(filters)}
        onChange={onChange}
      />
      <Layout>{_('matches at least')}</Layout>
      <Spinner
        value={atLeastCount}
        name={prefix + 'at_least_count'}
        type="int"
        min="0"
        size="5"
        onChange={onChange}
      />
      <Layout>{_('result(s) NVT(s)')}</Layout>
    </Divider>
  );
};

FilterCountLeastConditionPart.propTypes = {
  atLeastCount: PropTypes.number.isRequired,
  atLeastFilterId: PropTypes.id,
  condition: PropTypes.string.isRequired,
  filters: PropTypes.array.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(FilterCountLeastConditionPart);

// vim: set ts=2 sw=2 tw=80:
