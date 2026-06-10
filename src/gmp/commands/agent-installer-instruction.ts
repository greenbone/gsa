/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {isDefined} from 'gmp/utils/identity';
import {type InstallInstructionsData} from 'web/pages/agent-remote-installer/types';

class AgentInstallerInstructionsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_agent_installer_instruction'});
  }

  async getInstructions({
    lang,
    scannerId,
  }: {
    lang?: string;
    scannerId?: string;
  }) {
    const params: Record<string, string> = {};
    if (isDefined(lang)) {
      params.language_type = lang;
    }
    if (isDefined(scannerId)) {
      params.scanner_id = scannerId;
    }

    const response = await this.httpGetWithTransform(params);

    const {data} = response;
    const instructionsResponse = data.get_agent_installer_instruction as Record<
      string,
      unknown
    >;
    const instructionsElement =
      instructionsResponse.get_agent_installer_instruction_response as Record<
        string,
        unknown
      >;
    const jsonContent = instructionsElement.instruction as string;
    return response.set<InstallInstructionsData>(JSON.parse(jsonContent));
  }
}

export default AgentInstallerInstructionsCommand;
