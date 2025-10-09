/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import {HttpCommandPostParams} from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import Agent from 'gmp/models/agent';
import Filter from 'gmp/models/filter';
import {
  AGENT_CONTROLLER_SCANNER_TYPE,
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';

const log = logger.getLogger('gmp.commands.agents');

const AGENT_CONTROLLER_FILTER = Filter.fromString(
  `scanner_type=${AGENT_CONTROLLER_SCANNER_TYPE} or scanner_type=${AGENT_CONTROLLER_SENSOR_SCANNER_TYPE}`,
);

class AgentsCommand extends EntitiesCommand<Agent> {
  constructor(http: GmpHttp) {
    super(http, 'agent', Agent);
  }

  async deleteByIds(
    ids: string[],
    extraParams: HttpCommandPostParams = {},
  ): Promise<Response<string[], XmlMeta>> {
    log.debug('Deleting agent', {ids});
    const params = {
      ...extraParams,
      cmd: 'delete_agent',
      'agent_ids:': ids,
    };
    const response = await this.httpPost(params);
    return response.setData(ids);
  }

  // @ts-ignore
  async authorize(agents: Agent[]) {
    log.debug('Authorizing agent', {agents});
    const data: Record<string, string | number | boolean | undefined> = {
      cmd: 'modify_agent',
    };

    if (agents?.length) {
      // @ts-ignore
      data['agent_ids:'] = agents.map(agent => agent.id);
    }
    data.authorized = 1;
    const response = await this.httpPost(data);
    return response.setData(agents);
  }

  // @ts-ignore
  async revoke(agents: Agent[]) {
    log.debug('Revoking agent', {agents});
    const data: Record<string, string | number | boolean | undefined> = {
      cmd: 'modify_agent',
    };

    if (agents?.length) {
      // @ts-ignore
      data['agent_ids:'] = agents.map(agent => agent.id);
    }
    data.authorized = 0;
    const response = await this.httpPost(data);
    return response.setData(agents);
  }

  getSeverityAggregates({filter}: {filter?: Filter} = {}) {
    const combinedFilter = filter
      ? filter.copy().and(AGENT_CONTROLLER_FILTER)
      : AGENT_CONTROLLER_FILTER.copy();

    return this.getAggregates({
      aggregate_type: 'task',
      group_column: 'severity',
      usage_type: 'scan',
      filter: combinedFilter,
    });
  }

  getNetworkAggregates({filter}: {filter?: Filter} = {}) {
    return this.getAggregates({
      aggregate_type: 'agent',
      group_column: 'scanner',
    });
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_agents.get_agents_response;
  }

  async authorize(agents: Agent[]) {
    log.debug('Authorizing agent', {agents});
    await this.httpPost({
      cmd: 'modify_agent',
      authorized: YES_VALUE,
      'agent_ids:': map(agents, agent => agent.id),
    });
  }

  async revoke(agents: Agent[]) {
    log.debug('Revoking agent', {agents});
    await this.httpPost({
      cmd: 'modify_agent',
      authorized: NO_VALUE,
      'agent_ids:': map(agents, agent => agent.id),
    });
  }
}

export default AgentsCommand;
