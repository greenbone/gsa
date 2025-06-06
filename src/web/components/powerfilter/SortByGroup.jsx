/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

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
    <FormGroup direction="row" title={_('Sort by')}>
      <Select
        data-testid="sort-by"
        items={renderSortFieldItems()}
        name="sort_by"
        value={by}
        onChange={onSortByChange}
      />
      <Radio
        checked={order === 'sort'}
        data-testid="sort-order"
        name="sort_order"
        title={_('Ascending')}
        value="sort"
        onChange={onSortOrderChange}
      />
      <Radio
        checked={order === 'sort-reverse'}
        data-testid="sort-reverse"
        name="sort_order"
        title={_('Descending')}
        value="sort-reverse"
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
