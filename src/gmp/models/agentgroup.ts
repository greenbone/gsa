/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseToString} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface AgentGroupAgentElement {
  _id: string;
  name?: string;
}

interface AgentGroupScannerElement {
  _id: string;
  name?: string;
}

export interface AgentGroupElement extends ModelElement {
  scanner?: AgentGroupScannerElement;
  agents?: {
    agent?: AgentGroupAgentElement | AgentGroupAgentElement[];
  };
}

interface AgentGroupScanner {
  id: string;
  name?: string;
}

interface AgentGroupAgent {
  id: string;
  name?: string;
}

interface AgentGroupProperties extends ModelProperties {
  scanner?: AgentGroupScanner;
  agents?: AgentGroupAgent[];
}

class AgentGroup extends Model {
  static readonly entityType = 'agentgroup';

  readonly scanner?: AgentGroupScanner;
  readonly agents: AgentGroupAgent[];

  constructor({
    scanner,
    agents = [],
    ...properties
  }: AgentGroupProperties = {}) {
    super(properties);

    this.scanner = scanner;
    this.agents = agents;
  }

  static fromElement(element: AgentGroupElement = {}): AgentGroup {
    return new AgentGroup(this.parseElement(element));
  }

  static parseElement(element: AgentGroupElement = {}): AgentGroupProperties {
    const copy = super.parseElement(element) as AgentGroupProperties;

    const {scanner, agents} = element;

    copy.scanner = isDefined(scanner)
      ? {
          id: scanner._id,
          name: parseToString(scanner.name),
        }
      : undefined;

    copy.agents = map(agents?.agent, agent => ({
      id: agent._id,
      name: parseToString(agent.name),
    }));
    return copy;
  }

  getAgentCount(): number {
    return this.agents?.length ?? 0;
  }
}

export default AgentGroup;
