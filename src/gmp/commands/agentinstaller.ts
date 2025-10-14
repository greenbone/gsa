/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import GmpHttp from 'gmp/http/gmp';
import DefaultTransform from 'gmp/http/transform/default';
import AgentInstaller, {
  type AgentInstallerElement,
} from 'gmp/models/agentinstaller';
import type {Element} from 'gmp/models/model';

class AgentInstallerCommand extends EntityCommand<
  AgentInstaller,
  AgentInstallerElement
> {
  constructor(http: GmpHttp) {
    super(http, 'agent_installer', AgentInstaller);
  }

  async download(id: string) {
    return await this.httpGet(
      {
        cmd: 'get_agent_installer_file',
        agent_installer_id: id,
      },
      // @ts-expect-error
      {transform: DefaultTransform, responseType: 'arraybuffer'},
    );
  }

  getElementFromRoot(root: Element): AgentInstallerElement {
    // @ts-expect-error
    return root.get_agent_installer.get_agent_installers_response
      .agent_installer;
  }
}

export default AgentInstallerCommand;
