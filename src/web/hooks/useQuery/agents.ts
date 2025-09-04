/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Agent, {AgentElement} from 'gmp/models/agents';
import Filter from 'gmp/models/filter';
import {useGetQuery} from 'web/queries/useGetQuery';

export const useGetAgents = ({filter = undefined}: {filter?: Filter}) =>
  useGetQuery({
    cmd: 'get_agents',
    filter,
    name: 'agent',
    parseEntity: el => Agent.fromElement(el as AgentElement | undefined),
  });
