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
import registerCommand from 'gmp/command';

import Result from 'gmp/models/result';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

export class ResultsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'result', Result);
  }

  getEntitiesResponse(root) {
    return root.get_results.get_results_response;
  }

  get(params = {}, options) {
    return super.get({details: 1, ...params}, options);
  }

  getDescriptionWordCountsAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'result',
      group_column: 'description',
      aggregate_mode: 'word_counts',
      filter,
      maxGroups: 250,
    });
  }

  getWordCountsAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'result',
      group_column: 'vulnerability',
      aggregate_mode: 'word_counts',
      filter,
      maxGroups: 250,
    });
  }

  getSeverityAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'result',
      group_column: 'severity',
      filter,
    });
  }
}

export class ResultCommand extends EntityCommand {
  constructor(http) {
    super(http, 'result', Result);
  }

  getElementFromRoot(root) {
    return root.get_result.get_results_response.result;
  }
}

registerCommand('result', ResultCommand);
registerCommand('results', ResultsCommand);

// vim: set ts=2 sw=2 tw=80:
