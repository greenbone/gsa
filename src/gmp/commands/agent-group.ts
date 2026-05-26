/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand, {type EntityActionResponse} from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import AgentGroup, {type AgentGroupElement} from 'gmp/models/agent-group';
import {type Element} from 'gmp/models/model';

export interface AgentGroupCreateParams {
  agentIds?: string[];
  comment?: string;
  name: string;
  scannerId?: string;
  schedulerCronTime?: string;
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

  async create({
    name,
    comment,
    scannerId,
    agentIds,
    schedulerCronTime,
  }: AgentGroupCreateParams): Promise<EntityActionResponse> {
    const agentGroupData = {
      cmd: 'create_agent_group',
      name,
      comment,
      scanner_id: scannerId,
      'agent_ids:': agentIds,
      scheduler_cron_time: schedulerCronTime,
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
    };

    log.debug('Prepared payload', agentGroupData);

    await this.action(agentGroupData);
  }

  getElementFromRoot(root: Element): AgentGroupElement {
    // @ts-expect-error
    return root.get_agent_group.get_agent_group_response.agent_group;
  }
}

export default AgentGroupCommand;
