/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../utils/proptypes.js';
import {render_options, withPrefix} from '../utils/render.js';

import Select2 from '../components/form/select2.js';
import Spinner from '../components/form/spinner.js';
import Radio from '../components/form/radio.js';

const VALUE = "Filter count changed";

const FilterCountChangedConditionPart = ({
    condition,
    count,
    filterId,
    filters,
    prefix,
    onChange,
  }) => {
  return (
    <Layout flex box>
      <Radio title={_('Filter')}
        value={VALUE}
        checked={condition === VALUE}
        name="condition"
        onChange={onChange}/>
      <Select2
        value={filterId}
        name={prefix + 'filter_id'}
        onChange={onChange}>
        {render_options(filters)}
      </Select2>
      <Layout flex box>
        {_('matches at least')}
      </Layout>
      <Spinner
        value={count}
        name={prefix + 'count'}
        type="int"
        min="0" size="5"
        onChange={onChange}/>
      <Layout flex box>
        {_('result(s) more then previous scan')}
      </Layout>
    </Layout>
  );
};

FilterCountChangedConditionPart.propTypes = {
  condition: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  filterId: PropTypes.id,
  filters: PropTypes.arrayLike.isRequired,
  prefix: PropTypes.string,
  onChange: PropTypes.func,
};

export default withPrefix(FilterCountChangedConditionPart);

// vim: set ts=2 sw=2 tw=80:
