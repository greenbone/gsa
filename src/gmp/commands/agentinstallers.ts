/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import type GmpHttp from 'gmp/http/gmp';
import type {XmlResponseData} from 'gmp/http/transform/fastxml';
import AgentInstaller from 'gmp/models/agentinstaller';

class AgentInstallersCommand extends EntitiesCommand<AgentInstaller> {
  constructor(http: GmpHttp) {
    super(http, 'agent_installer', AgentInstaller);
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_agent_installers.get_agent_installers_response;
  }
}

export default AgentInstallersCommand;
