/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import {
  type HttpCommandInputParams,
  type HttpCommandOptions,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import Result from 'gmp/models/result';

interface GetAggregatesParams {
  filter?: Filter;
}

export class ResultsCommand extends EntitiesCommand<Result> {
  constructor(http: Http) {
    super(http, 'result', Result);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_results.get_results_response;
  }

  get(params: HttpCommandInputParams = {}, options?: HttpCommandOptions) {
    return super.get({details: 1, ...params}, options);
  }

  getDescriptionWordCountsAggregates({filter}: GetAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'result',
      group_column: 'description',
      aggregate_mode: 'word_counts',
      filter,
      maxGroups: 250,
    });
  }

  getWordCountsAggregates({filter}: GetAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'result',
      group_column: 'vulnerability',
      aggregate_mode: 'word_counts',
      filter,
      maxGroups: 250,
    });
  }

  getSeverityAggregates({filter}: GetAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'result',
      group_column: 'severity',
      filter,
    });
  }
}
