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

const VALUE = 'Filter count at least';

const FilterCountLeastConditionPart = ({
  condition,
  atLeastFilterId,
  atLeastCount,
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
        name={prefix + 'at_least_filter_id'}
        value={atLeastFilterId}
        onChange={onChange}
      />
      <Layout>{_('matches at least')}</Layout>
      <Spinner
        min="0"
        name={prefix + 'at_least_count'}
        type="int"
        value={atLeastCount}
        onChange={onChange}
      />
      <Layout>{_('result(s) NVT(s)')}</Layout>
    </Row>
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
