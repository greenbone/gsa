/* Copyright (C) 2017-2022 Greenbone AG
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

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';

import useTranslation from 'web/hooks/useTranslation';

const SortByGroup = ({
  by,
  fields = [],
  filter,
  order,
  onSortByChange,
  onSortOrderChange,
}) => {
  const [_] = useTranslation();
  const renderSortFieldItems = () => {
    return fields.map(({name: value, displayName: label}) => ({
      value,
      label,
    }));
  };

  if (isDefined(filter)) {
    by = filter.getSortBy();
    order = filter.getSortOrder();
  }
  return (
    <FormGroup title={_('Sort by')} direction="row">
      <Select
        name="sort_by"
        value={by}
        items={renderSortFieldItems()}
        onChange={onSortByChange}
      />
      <Radio
        name="sort_order"
        value="sort"
        checked={order === 'sort'}
        title={_('Ascending')}
        onChange={onSortOrderChange}
      />
      <Radio
        name="sort_order"
        value="sort-reverse"
        checked={order === 'sort-reverse'}
        title={_('Descending')}
        onChange={onSortOrderChange}
      />
    </FormGroup>
  );
};

SortByGroup.propTypes = {
  by: PropTypes.string,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      displayName: PropTypes.toString,
    }),
  ),
  filter: PropTypes.filter,
  order: PropTypes.oneOf(['sort', 'sort-reverse']),
  onSortByChange: PropTypes.func,
  onSortOrderChange: PropTypes.func,
};

export default SortByGroup;
