/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import AgentGroupsCommand from 'gmp/commands/agent-groups';
import EntityCommand, {
  type EntityActionResponse,
  type EntityCommandParams,
} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {_} from 'gmp/locale/lang';
import logger from 'gmp/log';
import AgentGroup, {type AgentGroupElement} from 'gmp/models/agent-group';
import {type FilterType} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import {filterString} from 'gmp/models/filter/utils';
import {type Element} from 'gmp/models/model';

export interface AgentGroupCreateParams {
  agentIds?: string[];
  comment?: string;
  name: string;
  scannerId?: string;
  schedulerCronTime?: string;
  maxDelaySeconds?: number;
}

export interface AgentGroupSaveParams extends Omit<
  AgentGroupCreateParams,
  'name'
> {
  id: string;
  name?: string;
}

const log = logger.getLogger('gmp.commands.agentgroup');

class AgentGroupCommand extends EntityCommand<AgentGroup, AgentGroupElement> {
  constructor(http: Http) {
    super(http, 'agent_group', AgentGroup);
  }

  async get(
    {id}: EntityCommandParams,
    {filter}: {filter?: FilterType | string} = {},
  ) {
    const groups = new AgentGroupsCommand(this.http);
    const response = await groups.getAll({
      filter: QueryFilter.fromString(filterString(filter)).set('uuid', id),
    });
    const group = response.data.find(group => group.id === id);
    if (!group) {
      throw new Error(
        _('The {{entity}} you were looking for could not be found.', {
          entity: _('Agent Group'),
        }),
      );
    }
    return response.setData(group);
  }

  async create({
    name,
    comment,
    scannerId,
    agentIds,
    schedulerCronTime,
    maxDelaySeconds = 0,
  }: AgentGroupCreateParams): Promise<EntityActionResponse> {
    const agentGroupData = {
      cmd: 'create_agent_group',
      name,
      comment,
      scanner_id: scannerId,
      'agent_ids:': agentIds,
      scheduler_cron_time: schedulerCronTime,
      max_delay_seconds: maxDelaySeconds,
    };

    log.debug('Prepared data for create calls', {
      agentGroupData,
    });

    const response = await this.entityAction(agentGroupData);
    return response;
  }

  async save({
    id,
    name,
    comment,
    scannerId,
    agentIds,
    schedulerCronTime,
    maxDelaySeconds = 0,
  }: AgentGroupSaveParams): Promise<void> {
    // Build agent group payload
    const agentGroupData = {
      cmd: 'save_agent_group',
      agent_group_id: id,
      name,
      comment,
      scanner_id: scannerId,
      'agent_ids:': agentIds,
      scheduler_cron_time: schedulerCronTime,
      max_delay_seconds: maxDelaySeconds,
    };

    log.debug('Prepared payload', agentGroupData);

    await this.action(agentGroupData);
  }

  getElementFromRoot(root: Element): AgentGroupElement {
    // @ts-expect-error
    return root.get_agent_group.get_agent_groups_response.agent_group;
  }
}

export default AgentGroupCommand;
