/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Agent, {AgentElement} from 'gmp/models/agents';
import Filter from 'gmp/models/filter';
import {useGetQuery} from 'web/queries/useGetQuery';
import {useSaveMutation} from 'web/queries/useSaveMutation';

interface AgentModifyParams {
  agents: {id: string}[];
  authorized?: number;
  config?: {
    agent_control?: {
      retry?: {
        attempts?: number;
        delay_in_seconds?: number;
        max_jitter_in_seconds?: number;
      };
    };
    agent_script_executor?: {
      bulk_size?: number;
      bulk_throttle_time_in_ms?: number;
      indexer_dir_depth?: number;
      scheduler_cron_time?: {
        item?: string | string[];
      };
    };
    heartbeat?: {
      interval_in_seconds?: number;
      miss_until_inactive?: number;
    };
  };
  comment?: string;
}

export const useGetAgents = ({
  filter = undefined,
  scannerId = undefined,
  enabled = true,
}: {
  filter?: Filter;
  scannerId?: string;
  enabled?: boolean;
}) => {
  let finalFilter = filter;

  if (scannerId) {
    const scannerFilter = Filter.fromString(`scanner=${scannerId}`);
    finalFilter = filter
      ? Filter.fromString(`${filter.toFilterString()} scanner=${scannerId}`)
      : scannerFilter;
  }

  return useGetQuery<Agent>({
    cmd: 'get_agents',
    filter: finalFilter,
    name: 'agent',
    parseEntity: el => Agent.fromElement(el as AgentElement | undefined),
    enabled,
  });
};

export const useModifyAgents = () =>
  useSaveMutation<AgentModifyParams, unknown>({
    entityKey: 'agent',
    method: 'save',
  });
