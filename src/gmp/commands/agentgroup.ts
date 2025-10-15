/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityActionResponse} from 'gmp/commands/entity';
import type GmpHttp from 'gmp/http/gmp';
import logger from 'gmp/log';
import AgentGroup, {type AgentGroupElement} from 'gmp/models/agentgroup';
import {type Element} from 'gmp/models/model';
import {parseYesNo} from 'gmp/parser';
import {isArray, isDefined} from 'gmp/utils/identity';

export interface AgentGroupCreateParams {
  agentIds?: string[];
  authorized?: boolean;
  comment?: string;
  name: string;
  scannerId?: string;
  attempts?: number;
  delayInSeconds?: number;
  maxJitterInSeconds?: number;
  bulkSize?: number;
  bulkThrottleTime?: number;
  indexerDirDepth?: number;
  intervalInSeconds?: number;
  missUntilInactive?: number;
  schedulerCronTimes?: string | string[];
}

export interface AgentGroupSaveParams
  extends Omit<AgentGroupCreateParams, 'name'> {
  id: string;
  name?: string;
}

const log = logger.getLogger('gmp.commands.agentgroup');

class AgentGroupCommand extends EntityCommand<AgentGroup, AgentGroupElement> {
  constructor(http: GmpHttp) {
    super(http, 'agent_group', AgentGroup);
  }

  async create({
    name,
    comment,
    scannerId,
    agentIds,
    authorized,
    attempts,
    delayInSeconds,
    maxJitterInSeconds,
    bulkSize,
    bulkThrottleTime,
    indexerDirDepth,
    intervalInSeconds,
    missUntilInactive,
    schedulerCronTimes,
  }: AgentGroupCreateParams): Promise<EntityActionResponse> {
    const agentGroupData = {
      cmd: 'create_agent_group',
      name,
      comment,
      scanner_id: scannerId,
      'agent_ids:': agentIds,
    };

    const agentData = {
      cmd: 'modify_agent',
      'agent_ids:': agentIds,
      authorized: parseYesNo(authorized),
      attempts,
      delay_in_seconds: delayInSeconds,
      max_jitter_in_seconds: maxJitterInSeconds,
      bulk_size: bulkSize,
      bulk_throttle_time_in_ms: bulkThrottleTime,
      indexer_dir_depth: indexerDirDepth,
      interval_in_seconds: intervalInSeconds,
      miss_until_inactive: missUntilInactive,
      'scheduler_cron_times:':
        isArray(schedulerCronTimes) || !isDefined(schedulerCronTimes)
          ? schedulerCronTimes
          : [schedulerCronTimes],
    };

    log.debug('Prepared data for both create calls', {
      agentGroupData,
      agentData,
    });

    const response = await this.entityAction(agentGroupData);
    await this.action(agentData);
    return response;
  }

  async save({
    id,
    name,
    comment,
    scannerId,
    agentIds,
    authorized,
    attempts,
    delayInSeconds,
    maxJitterInSeconds,
    bulkSize,
    bulkThrottleTime,
    indexerDirDepth,
    intervalInSeconds,
    missUntilInactive,
    schedulerCronTimes,
  }: AgentGroupSaveParams): Promise<void> {
    // Build agent group payload
    const agentGroupData = {
      cmd: 'save_agent_group',
      agent_group_id: id,
      name,
      comment,
      scanner_id: scannerId,
      'agent_ids:': agentIds,
    };

    // Build agent payload
    const agentData = {
      cmd: 'modify_agent',
      'agent_ids:': agentIds,
      authorized: parseYesNo(authorized),
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

    log.debug('Prepared payloads', {agentGroupData, agentData});

    await this.action(agentGroupData);
    await this.action(agentData);
  }

  getElementFromRoot(root: Element): AgentGroupElement {
    // @ts-expect-error
    return root.get_agent_group.get_agent_group_response.agent_group;
  }
}

export default AgentGroupCommand;
