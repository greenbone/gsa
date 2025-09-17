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

  save({id, name, comment, agents}: AgentGroupModifyParams) {
    log.debug('Modifying agent group', {
      id,
      name,
      comment,
      agents,
    });

    const data: Record<string, string | number | boolean | undefined> = {
      cmd: 'modify_agent_group',
      agent_group_id: id,
    };

    if (name !== undefined) {
      data.name = name;
    }

    if (comment !== undefined) {
      data.comment = comment;
    }

    data['agent_ids:'] =
      agents && agents.length > 0
        ? agents.map(agent => agent.id).join(',')
        : '';

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
      cmd: 'delete_agent_groups',
    };

    if (agentGroups?.length) {
      data['agent_group_ids:'] = agentGroups
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
