/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from '../../../locale.js';
import {map, is_defined} from '../../../utils.js';

import PropTypes from '../../proptypes.js';

import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';
import Select2 from '../form/select2.js';

class SortByGroup extends React.Component {

  renderSortFieldOptions() {
    let {fields} = this.props;
    return map(fields, field => {
      let value = field[0];
      let title = field[1];
      return <option key={value} value={value}>{title}</option>;
    });
  }

  render() {
    let {by, order, filter, onSortByChange, onSortOrderChange} = this.props;

    if (is_defined(filter)) {
      by = filter.getSortBy();
      order = filter.getSortOrder();
    }
    return (
      <FormGroup title={_('Sort by')}>
        <Select2
          name="sort_by"
          value={by}
          onChange={onSortByChange}>
          {this.renderSortFieldOptions()}
        </Select2>
        <Radio
          name="sort_order"
          value="sort"
          checked={order === 'sort'}
          title={_('Ascending')}
          onChange={onSortOrderChange}/>
        <Radio
          name="sort_order"
          value="sort-reverse"
          checked={order === 'sort-reverse'}
          title={_('Descending')}
          onChange={onSortOrderChange}/>
      </FormGroup>
    );
  }
}

SortByGroup.propTypes = {
  by: PropTypes.string,
  order: PropTypes.oneOf(['sort', 'sort-reverse']),
  filter: PropTypes.filter,
  fields: PropTypes.array,
  onSortByChange: PropTypes.func,
  onSortOrderChange: PropTypes.func,
};


export default SortByGroup;

// vim: set ts=2 sw=2 tw=80:
