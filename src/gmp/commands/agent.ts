/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import logger from 'gmp/log';
import Agent, {type AgentElement} from 'gmp/models/agent';
import {type Element} from 'gmp/models/model';
import {parseYesNo} from 'gmp/parser';

export interface AgentModifyParams {
  agentsIds: string[];
  authorized?: boolean;
  updateToLatest?: boolean;
  comment?: string;
  intervalInSeconds?: number;
}

const log = logger.getLogger('gmp.commands.agent');

class AgentCommand extends EntityCommand<Agent, AgentElement> {
  constructor(http: Http) {
    super(http, 'agent', Agent);
  }

  async delete({id}: {id: string}) {
    log.debug('Deleting agent', {id});
    await this.httpPostWithTransform({
      cmd: 'delete_agent',
      'agent_ids:': id,
    });
  }

  async save({
    agentsIds,
    authorized,
    updateToLatest,
    comment,
    intervalInSeconds,
  }: AgentModifyParams) {
    const data = {
      cmd: 'modify_agent',
      'agent_ids:': agentsIds,
      authorized: parseYesNo(authorized),
      update_to_latest: parseYesNo(updateToLatest),
      comment,
      interval_in_seconds: intervalInSeconds,
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
