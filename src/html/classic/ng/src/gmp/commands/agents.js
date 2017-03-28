/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import logger from '../../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Agent from '../models/agent.js';

const log = logger.getLogger('gmp.commands.agents');

export class AgentCommand extends EntityCommand {

  constructor(http) {
    super(http, 'agent', Agent);
  }

  getElementFromRoot(root) {
    return root.get_agent.get_agents_response.agent;
  }

  verify({id}) {
    return this.httpPost({
      cmd: 'verify_agent',
      id,
      next: 'get_agent',
    });
  }

  create({name, comment = '', installer, installer_sig}) {
    const data = {
      cmd: 'create_agent',
      name,
      comment,
      installer,
      installer_sig,
      next: 'get_agent',
    };
    log.debug('Creating new agent', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  save({id, name, comment = ''}) {
    const data = {
      cmd: 'save_agent',
      id,
      name,
      comment,
      next: 'get_agent',
    };
    log.debug('Saving agent', data);
    return this.httpPost(data).then(this.transformResponse);
  }
}

export class AgentsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'agent', Agent);
  }

  getEntitiesResponse(root) {
    return root.get_agents.get_agents_response;
  }
}

register_command('agent', AgentCommand);
register_command('agents', AgentsCommand);

// vim: set ts=2 sw=2 tw=80:
