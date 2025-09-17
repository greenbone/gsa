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
import Agent, {AgentElement} from 'gmp/models/agents';
import Filter from 'gmp/models/filter';
import {Element} from 'gmp/models/model';

interface AgentControlConfig {
  retry?: {
    attempts?: number;
    delay_in_seconds?: number;
    max_jitter_in_seconds?: number;
  };
}

interface AgentScriptExecutorConfig {
  bulk_size?: number;
  bulk_throttle_time_in_ms?: number;
  indexer_dir_depth?: number;
  scheduler_cron_time?: {
    item?: string | string[];
  };
}

interface HeartbeatConfig {
  interval_in_seconds?: number;
  miss_until_inactive?: number;
}

interface AgentConfigParams {
  agent_control?: AgentControlConfig;
  agent_script_executor?: AgentScriptExecutorConfig;
  heartbeat?: HeartbeatConfig;
}

interface AgentModifyParams {
  agents: {id: string}[];
  authorized?: number;
  config?: AgentConfigParams;
  comment?: string;
}

const log = logger.getLogger('gmp.commands.agents');

export class AgentCommand extends EntityCommand<Agent, AgentElement> {
  constructor(http: GmpHttp) {
    super(http, 'agent', Agent);
  }

  save({agents, authorized, config, comment}: AgentModifyParams) {
    log.debug('Modifying agents', {
      agents,
      authorized,
      config,
      comment,
    });

    const data: Record<
      string,
      string | number | boolean | string[] | undefined
    > = {
      cmd: 'modify_agents',
    };

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
    if (config?.agent_script_executor?.scheduler_cron_time?.item) {
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

  getElementFromRoot(root: Element): AgentElement {
    // @ts-expect-error
    return root.get_agent.get_agents_response.agent;
  }
}

export class AgentsCommand extends EntitiesCommand<Agent> {
  constructor(http: GmpHttp) {
    super(http, 'agent', Agent);
  }

  deleteAgents(agents: {id: string}[]) {
    log.debug('Deleting agents', {agents});

    const data: Record<string, string | number | boolean | undefined> = {
      cmd: 'delete_agents',
    };

    if (agents?.length) {
      data['agent_ids:'] = agents.map(agent => agent.id).join(',');
    }

    return this.httpPost(data);
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'agent',
      group_column: 'severity',
      filter,
    });
  }

  getNetworkAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'agent',
      group_column: 'scanner',
      filter,
    });
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_agents.get_agents_response;
  }
}

registerCommand('agents', AgentsCommand);
registerCommand('agent', AgentCommand);
