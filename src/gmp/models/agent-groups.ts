/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Date as GmpDate} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseDate, parseText, parseYesNo, YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

export interface AgentGroupAgent {
  _id?: string;
  id?: string;
  name?: string;
}

export interface AgentGroupScanner {
  id: string;
  name?: string;
}

export interface AgentGroupElement extends ModelElement {
  name?: string;
  comment?: string;
  creation_time?: string;
  creationTime?: string | GmpDate;
  modification_time?: string;
  modificationTime?: string | GmpDate;
  writable?: YesNo;
  in_use?: YesNo;
  inUse?: YesNo;
  scanner?: {
    _id?: string;
    id?: string;
    name?: string;
  };
  agents?:
    | {
        agent?: AgentGroupAgent | AgentGroupAgent[];
      }
    | AgentGroupAgent[];
}

interface AgentGroupProperties extends ModelProperties {
  name?: string;
  comment?: string;
  creationTime?: GmpDate;
  modificationTime?: GmpDate;
  writable?: YesNo;
  inUse?: boolean;
  scanner?: AgentGroupScanner;
  agents?: AgentGroupAgent[];
}

class AgentGroup extends Model {
  static readonly entityType = 'agentgroup';

  readonly name?: string;
  readonly comment?: string;
  readonly creationTime?: GmpDate;
  readonly modificationTime?: GmpDate;
  readonly writable?: YesNo;
  readonly inUse?: boolean;
  readonly scanner?: AgentGroupScanner;
  readonly agents?: AgentGroupAgent[];

  constructor({
    name,
    comment,
    creationTime,
    modificationTime,
    writable,
    inUse,
    scanner,
    agents,
    ...properties
  }: AgentGroupProperties = {}) {
    super(properties);

    this.name = name;
    this.comment = comment;
    this.creationTime = creationTime;
    this.modificationTime = modificationTime;
    this.writable = writable;
    this.inUse = inUse;
    this.scanner = scanner;
    this.agents = agents;
  }

  static fromElement(element: AgentGroupElement = {}): AgentGroup {
    const props = this.parseElement(element);
    return new AgentGroup(props);
  }

  static parseElement(element: AgentGroupElement = {}): AgentGroupProperties {
    const copy = super.parseElement(element) as AgentGroupProperties;

    const {
      name,
      comment,
      creation_time,
      creationTime,
      modification_time,
      modificationTime,
      writable,
      in_use,
      inUse,
      scanner,
      agents,
    } = element;

    copy.name = parseText(name);
    copy.comment = parseText(comment);

    const creationTimeValue = creation_time || creationTime;
    copy.creationTime = isDefined(creationTimeValue)
      ? typeof creationTimeValue === 'string'
        ? parseDate(creationTimeValue)
        : creationTimeValue
      : undefined;

    const modificationTimeValue = modification_time || modificationTime;
    copy.modificationTime = isDefined(modificationTimeValue)
      ? typeof modificationTimeValue === 'string'
        ? parseDate(modificationTimeValue)
        : modificationTimeValue
      : undefined;

    copy.writable = parseYesNo(writable);
    copy.inUse = parseYesNo(in_use || inUse) === 1;

    copy.scanner = isDefined(scanner)
      ? {
          id: scanner._id || scanner.id || '',
          name: parseText(scanner.name),
        }
      : undefined;

    if (isDefined(agents)) {
      if (Array.isArray(agents)) {
        copy.agents = agents.map(agent => ({
          id: agent._id || agent.id || '',
          name: parseText(agent.name),
        }));
      } else if (isDefined(agents.agent)) {
        const agentData = agents.agent;
        if (Array.isArray(agentData)) {
          copy.agents = agentData.map(agent => ({
            id: agent._id || agent.id || '',
            name: parseText(agent.name),
          }));
        } else {
          copy.agents = [
            {
              id: agentData._id || agentData.id || '',
              name: parseText(agentData.name),
            },
          ];
        }
      } else {
        copy.agents = [];
      }
    }

    return copy;
  }

  isWritable(): boolean {
    return this.writable === 1;
  }

  isInUse(): boolean {
    return this.inUse === true;
  }
  getAgentCount(): number {
    return this.agents?.length || 0;
  }
}

export default AgentGroup;
