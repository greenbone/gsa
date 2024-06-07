/* Copyright (C) 2016-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Row from 'web/components/layout/row';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withPrefix from 'web/utils/withPrefix';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import Radio from 'web/components/form/radio';

import useTranslation from 'web/hooks/useTranslation';

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
