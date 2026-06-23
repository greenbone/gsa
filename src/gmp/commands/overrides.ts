/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type Http from 'gmp/http/http';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';
import Override from 'gmp/models/override';

interface OverrideAggregateParams {
  filter?: Filter | string;
}

class OverridesCommand extends EntitiesCommand<Override> {
  constructor(http: Http) {
    super(http, 'override', Override);
    this.setDefaultParam('details', 1);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_overrides.get_overrides_response;
  }

  getActiveDaysAggregates({filter}: OverrideAggregateParams = {}) {
    return this.getAggregates({
      aggregate_type: 'override',
      group_column: 'active_days',
      filter,
      maxGroups: 250,
    });
  }

  getCreatedAggregates({filter}: OverrideAggregateParams = {}) {
    return this.getAggregates({
      aggregate_type: 'override',
      group_column: 'created',
      aggregate_mode: 'count',
      filter,
    });
  }

  getWordCountsAggregates({filter}: OverrideAggregateParams = {}) {
    return this.getAggregates({
      aggregate_type: 'override',
      group_column: 'text',
      aggregate_mode: 'word_counts',
      filter,
    });
  }
}

export default OverridesCommand;
