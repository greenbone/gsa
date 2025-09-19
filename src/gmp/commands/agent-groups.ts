/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import GmpHttp from 'gmp/http/gmp';
import {XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import AgentGroup, {AgentGroupElement} from 'gmp/models/agent-groups';
import Filter from 'gmp/models/filter';
import {Element} from 'gmp/models/model';

interface AgentGroupCreateParams {
  name: string;
  comment?: string;
  scannerId?: string;
  agents?: {id: string}[];
  authorized?: 0 | 1;
  config?: any;
}

const log = logger.getLogger('gmp.commands.agentgroups');

export class AgentGroupCommand extends EntityCommand<
  AgentGroup,
  AgentGroupElement
> {
  constructor(http: GmpHttp) {
    super(http, 'agent_group', AgentGroup);
  }

  async create({
    name,
    comment,
    scannerId,
    agents,
    authorized,
    config,
  }: AgentGroupCreateParams) {
    log.debug('Creating agent group', {
      name,
      comment,
      scannerId,
      agents,
      authorized,
      config,
    });

    const agentGroupData: Record<
      string,
      string | number | boolean | undefined
    > = {
      cmd: 'create_agent_group',
      name,
    };

    if (comment !== undefined) {
      agentGroupData.comment = comment;
    }
    if (scannerId !== undefined) {
      agentGroupData.scanner_id = scannerId;
    }

    agentGroupData['agent_ids:'] =
      agents && agents.length > 0
        ? agents.map(agent => agent.id).join(',')
        : '';

    const agentData: Record<
      string,
      string | number | boolean | string[] | undefined
    > = {
      cmd: 'modify_agent',
    };

    if (agents?.length) {
      agentData['agent_ids:'] = agents.map(agent => agent.id).join(',');
    }

    if (authorized !== undefined) {
      agentData.authorized = authorized;
    }

    /*
     * We expect the values to always be present from the fetch,
     * if value is not present, we send undefined.
     */
    const attempts = config?.agent_control?.retry?.attempts;
    const delayInSeconds = config?.agent_control?.retry?.delay_in_seconds;
    const maxJitterInSeconds =
      config?.agent_control?.retry?.max_jitter_in_seconds;
    const bulkSize = config?.agent_script_executor?.bulk_size;
    const bulkThrottleTime =
      config?.agent_script_executor?.bulk_throttle_time_in_ms;
    const indexerDirDepth = config?.agent_script_executor?.indexer_dir_depth;
    if (
      config?.agent_script_executor?.scheduler_cron_time?.item !== undefined
    ) {
      const cronTime = config.agent_script_executor.scheduler_cron_time.item;
      if (Array.isArray(cronTime)) {
        agentData['scheduler_cron_times:'] = cronTime;
      } else {
        agentData['scheduler_cron_times:'] = [cronTime];
      }
    } else {
      agentData['scheduler_cron_times:'] = ['0 */12 * * *'];
    }

    const intervalInSeconds = config?.heartbeat?.interval_in_seconds;
    const missUntilInactive = config?.heartbeat?.miss_until_inactive;

    agentData.attempts = attempts;
    agentData.delay_in_seconds = delayInSeconds;
    agentData.max_jitter_in_seconds = maxJitterInSeconds;

    agentData.bulk_size = bulkSize;
    agentData.bulk_throttle_time_in_ms = bulkThrottleTime;
    agentData.indexer_dir_depth = indexerDirDepth;

    agentData.interval_in_seconds = intervalInSeconds;
    agentData.miss_until_inactive = missUntilInactive;

    log.debug('Prepared data for both create calls', {
      agentGroupData,
      agentData,
    });

    const [agentGroupResult, agentResult] = await Promise.allSettled([
      this.action(agentGroupData),
      this.action(agentData),
    ]);

    const agentGroupSuccess = agentGroupResult.status === 'fulfilled';
    const agentSuccess = agentResult.status === 'fulfilled';

    log.debug('API call results', {
      agentGroupSuccess,
      agentSuccess,
      agentGroupResult:
        agentGroupResult.status === 'fulfilled'
          ? 'success'
          : agentGroupResult.reason,
      agentResult:
        agentResult.status === 'fulfilled' ? 'success' : agentResult.reason,
    });

    if (agentGroupSuccess && agentSuccess) {
      log.debug('Both create operations completed successfully');
      return {
        success: true,
        agentGroupResponse: agentGroupResult.value,
        agentResponse: agentResult.value,
      };
    }

    if (!agentGroupSuccess && !agentSuccess) {
      const error = new Error(
        `Both operations failed. Agent Group: ${agentGroupResult.reason?.message || agentGroupResult.reason}. Agent: ${agentResult.reason?.message || agentResult.reason}`,
      );
      log.error('Both create operations failed', {
        agentGroupError: agentGroupResult.reason,
        agentError: agentResult.reason,
      });
      throw error;
    }

    if (agentGroupSuccess && !agentSuccess) {
      log.error('Agent group created but agent configuration failed', {
        agentError: agentResult.reason,
      });

      // TODO: Consider implementing rollback to delete the created agent group
      const error = new Error(
        `Agent group was created successfully, but agent configuration failed: ${agentResult.reason?.message || agentResult.reason}`,
      );
      (error as any).partialSuccess = true;
      (error as any).agentGroupResponse = agentGroupResult.value;
      throw error;
    }

    if (!agentGroupSuccess && agentSuccess) {
      log.error('Agent configuration updated but agent group creation failed', {
        agentGroupError: agentGroupResult.reason,
      });

      const error = new Error(
        `Agent configuration was updated successfully, but agent group creation failed: ${agentGroupResult.reason?.message || agentGroupResult.reason}`,
      );
      (error as any).partialSuccess = true;
      (error as any).agentResponse = agentResult.value;
      throw error;
    }

    throw new Error('Unexpected state in create operation');
  }

  async save({id, name, comment, scannerId, agents, authorized, config}) {
    log.debug('Modifying agent group', {
      id,
      name,
      comment,
      scannerId,
      agents,
      authorized,
      config,
    });

    const agentGroupData: Record<
      string,
      string | number | boolean | undefined
    > = {
      cmd: 'save_agent_group',
      agent_group_id: id,
    };

    if (name !== undefined) {
      agentGroupData.name = name;
    }
    if (comment !== undefined) {
      agentGroupData.comment = comment;
    }
    if (scannerId !== undefined) {
      agentGroupData.scanner_id = scannerId;
    }
    if (agents?.length) {
      agentGroupData['agent_ids:'] = agents.map(agent => agent.id).join(',');
    }

    const agentData: Record<
      string,
      string | number | boolean | string[] | undefined
    > = {
      cmd: 'modify_agent',
    };

    if (agents?.length) {
      agentData['agent_ids:'] = agents.map(agent => agent.id).join(',');
    }

    if (authorized !== undefined) {
      agentData.authorized = authorized;
    }

    /*
     * We expect the values to always be present from the fetch,
     * if value is not present, we send undefined.
     */
    const attempts = config?.agent_control?.retry?.attempts;
    const delayInSeconds = config?.agent_control?.retry?.delay_in_seconds;
    const maxJitterInSeconds =
      config?.agent_control?.retry?.max_jitter_in_seconds;
    const bulkSize = config?.agent_script_executor?.bulk_size;
    const bulkThrottleTime =
      config?.agent_script_executor?.bulk_throttle_time_in_ms;
    const indexerDirDepth = config?.agent_script_executor?.indexer_dir_depth;
    if (
      config?.agent_script_executor?.scheduler_cron_time?.item !== undefined
    ) {
      const cronTime = config.agent_script_executor.scheduler_cron_time.item;
      if (Array.isArray(cronTime)) {
        agentData['scheduler_cron_times:'] = cronTime;
      } else {
        agentData['scheduler_cron_times:'] = [cronTime];
      }
    } else {
      agentData['scheduler_cron_times:'] = ['0 */12 * * *'];
    }

    const intervalInSeconds = config?.heartbeat?.interval_in_seconds;
    const missUntilInactive = config?.heartbeat?.miss_until_inactive;

    agentData.attempts = attempts;
    agentData.delay_in_seconds = delayInSeconds;
    agentData.max_jitter_in_seconds = maxJitterInSeconds;

    agentData.bulk_size = bulkSize;
    agentData.bulk_throttle_time_in_ms = bulkThrottleTime;
    agentData.indexer_dir_depth = indexerDirDepth;

    agentData.interval_in_seconds = intervalInSeconds;
    agentData.miss_until_inactive = missUntilInactive;

    log.debug('Prepared data for both calls', {
      agentGroupData,
      agentData,
    });

    const [agentGroupResult, agentResult] = await Promise.allSettled([
      this.action(agentGroupData),
      this.action(agentData),
    ]);

    const agentGroupSuccess = agentGroupResult.status === 'fulfilled';
    const agentSuccess = agentResult.status === 'fulfilled';

    log.debug('API call results', {
      agentGroupSuccess,
      agentSuccess,
      agentGroupResult:
        agentGroupResult.status === 'fulfilled'
          ? 'success'
          : agentGroupResult.reason,
      agentResult:
        agentResult.status === 'fulfilled' ? 'success' : agentResult.reason,
    });

    if (agentGroupSuccess && agentSuccess) {
      log.debug('Both modify operations completed successfully');
      return {
        success: true,
        agentGroupResponse: agentGroupResult.value,
        agentResponse: agentResult.value,
      };
    }

    if (!agentGroupSuccess && !agentSuccess) {
      const error = new Error(
        `Both operations failed. Agent Group: ${agentGroupResult.reason?.message || agentGroupResult.reason}. Agent: ${agentResult.reason?.message || agentResult.reason}`,
      );
      log.error('Both modify operations failed', {
        agentGroupError: agentGroupResult.reason,
        agentError: agentResult.reason,
      });
      throw error;
    }

    if (agentGroupSuccess && !agentSuccess) {
      log.error('Agent group updated but agent configuration failed', {
        agentError: agentResult.reason,
      });

      const error = new Error(
        `Agent group was updated successfully, but agent configuration failed: ${agentResult.reason?.message || agentResult.reason}`,
      );
      (error as any).partialSuccess = true;
      (error as any).agentGroupResponse = agentGroupResult.value;
      throw error;
    }

    if (!agentGroupSuccess && agentSuccess) {
      log.error('Agent configuration updated but agent group failed', {
        agentGroupError: agentGroupResult.reason,
      });

      // TODO: Consider implementing rollback to delete the created agent group
      const error = new Error(
        `Agent configuration was updated successfully, but agent group update failed: ${agentGroupResult.reason?.message || agentGroupResult.reason}`,
      );
      (error as any).partialSuccess = true;
      (error as any).agentResponse = agentResult.value;
      throw error;
    }

    throw new Error('Unexpected state in save operation');
  }

  getElementFromRoot(root: Element): AgentGroupElement {
    // @ts-expect-error
    return root.get_agent_group.get_agent_group_response.agent_group;
  }
}

export class AgentGroupsCommand extends EntitiesCommand<AgentGroup> {
  constructor(http: GmpHttp) {
    super(http, 'agent_group', AgentGroup);
  }

  deleteAgentGroups(agentGroups: {id: string}[]) {
    log.debug('Deleting agent groups', {agentGroups});

    const data: Record<string, string | number | boolean | undefined> = {
      cmd: 'delete_agent_group',
    };

    if (agentGroups?.length) {
      data['agent_group_id'] = agentGroups
        .map(agentGroup => agentGroup.id)
        .join(',');
    }

    return this.httpPost(data);
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'agent_group',
      group_column: 'severity',
      filter,
    });
  }

  getNetworkAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'agent_group',
      group_column: 'scanner',
      filter,
    });
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_agent_groups.get_agent_groups_response;
  }
}

registerCommand('agentgroups', AgentGroupsCommand);
registerCommand('agentgroup', AgentGroupCommand);
