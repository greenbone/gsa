/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import logger from '../log.js';

import registerCommand from '../command';

import Agent from '../models/agent';

import DefaultTransform from '../http/transform/default';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.agents');

class AgentCommand extends EntityCommand {
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
    });
  }

  create({name, comment = '', installer, installer_sig}) {
    const data = {
      cmd: 'create_agent',
      name,
      comment,
      installer,
      installer_sig,
    };
    log.debug('Creating new agent', data);
    return this.action(data);
  }

  save({id, name, comment = ''}) {
    const data = {
      cmd: 'save_agent',
      id,
      name,
      comment,
    };
    log.debug('Saving agent', data);
    return this.action(data);
  }

  downloadInstaller({id}) {
    return this.httpGet(
      {
        cmd: 'download_agent',
        agent_format: 'installer',
        agent_id: id,
      },
      {transform: DefaultTransform, responseType: 'arraybuffer'},
    );
  }
}

class AgentsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'agent', Agent);
  }

  getEntitiesResponse(root) {
    return root.get_agents.get_agents_response;
  }
}

registerCommand('agent', AgentCommand);
registerCommand('agents', AgentsCommand);

// vim: set ts=2 sw=2 tw=80:
