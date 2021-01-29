/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import Radio from 'web/components/form/radio';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

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
