/* Greenbone Security Assistant
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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
import {
  extract_column_info_json,
  extract_filter_info_json,
  extract_simple_records_json,
} from '../helper.js';

import BaseChartGenerator from './base.js';

class AggregateChartGenerator extends BaseChartGenerator {

  constructor(name) {
    super(name);
    this.command = 'get_aggregate';
  }

  extractData(data, gen_params) {
    const response = data.get_aggregate.get_aggregates_response;
    const {aggregate} = response;
    const column_info = extract_column_info_json(aggregate, gen_params);
    const records = extract_simple_records_json(aggregate.group);
    const filter_info = extract_filter_info_json(response.filters);
    return {
      records,
      column_info,
      filter_info,
    };
  }
}

export default AggregateChartGenerator;

// vim: set ts=2 sw=2 tw=80:
