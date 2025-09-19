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
}

interface AgentGroupModifyParams {
  id: string;
  name?: string;
  comment?: string;
  agents?: {id: string}[];
}

const log = logger.getLogger('gmp.commands.agentgroups');

export class AgentGroupCommand extends EntityCommand<
  AgentGroup,
  AgentGroupElement
> {
  constructor(http: GmpHttp) {
    super(http, 'agent_group', AgentGroup);
  }

  create({name, comment, scannerId, agents}: AgentGroupCreateParams) {
    log.debug('Creating agent group', {
      name,
      comment,
      scannerId,
      agents,
    });

    const data: Record<string, string | number | boolean | undefined> = {
      cmd: 'create_agent_group',
      name,
    };

    if (comment !== undefined) {
      data.comment = comment;
    }
    if (scannerId !== undefined) {
      data.scanner_id = scannerId;
    }

    data['agent_ids:'] =
      agents && agents.length > 0
        ? agents.map(agent => agent.id).join(',')
        : '';

    return this.action(data);
  }

  save({agents, authorized, config, comment}) {
    log.debug('Modifying agent', {
      agents,
      authorized,
      config,
      comment,
    });

    const data: Record<
      string,
      string | number | boolean | string[] | undefined
    > = {
      cmd: 'modify_agent',
    };
    console.log('config', config);
    if (agents?.length) {
      data['agent_ids:'] = agents.map(agent => agent.id).join(',');
    }

    if (authorized !== undefined) {
      data.authorized = authorized;
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
        data['scheduler_cron_times:'] = cronTime;
      } else {
        data['scheduler_cron_times:'] = [cronTime];
      }
    } else {
      data['scheduler_cron_times:'] = ['0 */12 * * *'];
    }

    const intervalInSeconds = config?.heartbeat?.interval_in_seconds;
    const missUntilInactive = config?.heartbeat?.miss_until_inactive;

    data.attempts = attempts;
    data.delay_in_seconds = delayInSeconds;
    data.max_jitter_in_seconds = maxJitterInSeconds;

    data.bulk_size = bulkSize;
    data.bulk_throttle_time_in_ms = bulkThrottleTime;
    data.indexer_dir_depth = indexerDirDepth;

    data.interval_in_seconds = intervalInSeconds;
    data.miss_until_inactive = missUntilInactive;

    log.debug('Final data being sent to modify_agents:', data);

    return this.action(data);
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
