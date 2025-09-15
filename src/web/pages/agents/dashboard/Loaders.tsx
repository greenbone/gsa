/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useQuery} from '@tanstack/react-query';
import Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';

interface UseAgentsAggregatesParams {
  filter?: Filter;
}

interface LoaderProps {
  filter?: Filter;
  children: (props: {
    data: any;
    isLoading: boolean;
    error: Error | null;
  }) => React.ReactNode;
}

export const AGENTS_SEVERITY = 'agents-severity';
export const AGENTS_NETWORK = 'agents-network';

export const useGetAgentsSeverityAggregates = ({
  filter,
}: UseAgentsAggregatesParams) => {
  const gmp = useGmp();
  const {token} = gmp.settings;

  return useQuery({
    enabled: Boolean(token),
    queryKey: ['agents-severity-aggregates', token, filter],
    queryFn: async () => {
      // @ts-expect-error
      const response = await gmp.agents.getSeverityAggregates({filter});
      return response.data;
    },
    refetchInterval: 10000000,
  });
};

export const useGetAgentsNetworkAggregates = ({
  filter,
}: UseAgentsAggregatesParams) => {
  const gmp = useGmp();
  const {token} = gmp.settings;

  return useQuery({
    enabled: Boolean(token),
    queryKey: ['agents-network-aggregates', token, filter],
    queryFn: async () => {
      // @ts-expect-error
      const response = await gmp.agents.getNetworkAggregates({filter});
      return response.data;
    },
    refetchInterval: 10000000,
  });
};

export const AgentsSeverityLoader = ({filter, children}: LoaderProps) => {
  const {data, isLoading, error} = useGetAgentsSeverityAggregates({filter});

  return children({
    data,
    isLoading,
    error,
  });
};

export const AgentsNetworkLoader = ({filter, children}: LoaderProps) => {
  const {data, isLoading, error} = useGetAgentsNetworkAggregates({filter});

  return children({
    data,
    isLoading,
    error,
  });
};
