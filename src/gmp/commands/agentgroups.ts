/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import GmpHttp from 'gmp/http/gmp';
import {XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import AgentGroup from 'gmp/models/agentgroup';
import Filter from 'gmp/models/filter';

const log = logger.getLogger('gmp.commands.agentgroups');

class AgentGroupsCommand extends EntitiesCommand<AgentGroup> {
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

export default AgentGroupsCommand;
