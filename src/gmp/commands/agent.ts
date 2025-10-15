/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type GmpHttp from 'gmp/http/gmp';
import logger from 'gmp/log';
import Agent, {type AgentElement} from 'gmp/models/agent';
import {type Element} from 'gmp/models/model';
import {parseYesNo} from 'gmp/parser';
import {isArray, isDefined} from 'gmp/utils/identity';

export interface AgentModifyParams {
  agentsIds: string[];
  authorized?: boolean;
  comment?: string;
  attempts?: number;
  delayInSeconds?: number;
  maxJitterInSeconds?: number;
  bulkSize?: number;
  bulkThrottleTime?: number;
  indexerDirDepth?: number;
  schedulerCronTimes?: string | string[];
  intervalInSeconds?: number;
  missUntilInactive?: number;
}

const log = logger.getLogger('gmp.commands.agent');

class AgentCommand extends EntityCommand<Agent, AgentElement> {
  constructor(http: GmpHttp) {
    super(http, 'agent', Agent);
  }

  async delete({id}: {id: string}) {
    log.debug('Deleting agent', {id});
    await this.httpPost({
      cmd: 'delete_agent',
      'agent_ids:': id,
    });
  }

  async save({
    agentsIds,
    authorized,
    comment,
    attempts,
    delayInSeconds,
    maxJitterInSeconds,
    bulkSize,
    bulkThrottleTime,
    indexerDirDepth,
    schedulerCronTimes,
    intervalInSeconds,
    missUntilInactive,
  }: AgentModifyParams) {
    const data = {
      cmd: 'modify_agent',
      'agent_ids:': agentsIds,
      authorized: parseYesNo(authorized),
      comment,
      'scheduler_cron_times:':
        isArray(schedulerCronTimes) || !isDefined(schedulerCronTimes)
          ? schedulerCronTimes
          : [schedulerCronTimes],
      attempts,
      delay_in_seconds: delayInSeconds,
      max_jitter_in_seconds: maxJitterInSeconds,
      bulk_size: bulkSize,
      bulk_throttle_time_in_ms: bulkThrottleTime,
      indexer_dir_depth: indexerDirDepth,
      interval_in_seconds: intervalInSeconds,
      miss_until_inactive: missUntilInactive,
    };

    log.debug('Final data being sent to modify_agents:', data);

    await this.action(data);
  }

  getElementFromRoot(root: Element): AgentElement {
    // @ts-expect-error
    return root.get_agent.get_agents_response.agent;
  }
}

export default AgentCommand;
