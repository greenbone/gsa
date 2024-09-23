/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
