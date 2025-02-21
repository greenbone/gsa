/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import logger from 'gmp/log';
import Override, {
  ANY,
  MANUAL,
  ACTIVE_YES_ALWAYS_VALUE,
  DEFAULT_DAYS,
  SEVERITY_FALSE_POSITIVE,
} from 'gmp/models/override';
import {NO_VALUE} from 'gmp/parser';


const log = logger.getLogger('gmp.commands.overrides');

class OverrideCommand extends EntityCommand {
  constructor(http) {
    super(http, 'override', Override);
  }

  getElementFromRoot(root) {
    return root.get_override.get_overrides_response.override;
  }

  create(args) {
    return this._save({...args, cmd: 'create_override'});
  }

  save(args) {
    return this._save({...args, cmd: 'save_override'});
  }

  _save(args) {
    const {
      cmd,
      oid,
      id,
      active = ACTIVE_YES_ALWAYS_VALUE,
      days = DEFAULT_DAYS,
      hosts = ANY,
      hosts_manual = '',
      result_id = '',
      result_uuid = '',
      port = ANY,
      port_manual = '',
      severity = '',
      task_id = '',
      task_uuid = '',
      text,
      custom_severity = NO_VALUE,
      newSeverity = '',
      new_severity_from_list = SEVERITY_FALSE_POSITIVE,
    } = args;
    log.debug('Saving override', args);
    return this.action({
      cmd,
      oid,
      id,
      active,
      custom_severity,
      new_severity: newSeverity,
      new_severity_from_list,
      days,
      hosts: hosts === MANUAL ? '--' : '',
      hosts_manual,
      result_id,
      result_uuid,
      task_id,
      task_uuid,
      port: port === MANUAL ? '--' : '',
      port_manual,
      severity,
      text,
    });
  }
}

class OverridesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'override', Override);
    this.setDefaultParam('details', 1);
  }

  getEntitiesResponse(root) {
    return root.get_overrides.get_overrides_response;
  }

  getActiveDaysAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'override',
      group_column: 'active_days',
      filter,
      maxGroups: 250,
    });
  }

  getCreatedAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'override',
      group_column: 'created',
      aggregate_mode: 'count',
      filter,
    });
  }

  getWordCountsAggregates({filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'override',
      group_column: 'text',
      aggregate_mode: 'word_counts',
      filter,
    });
  }
}

registerCommand('override', OverrideCommand);
registerCommand('overrides', OverridesCommand);
