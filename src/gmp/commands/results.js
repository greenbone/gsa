/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import Result from 'gmp/models/result';

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
