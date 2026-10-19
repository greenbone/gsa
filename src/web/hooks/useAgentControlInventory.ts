/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';

const MANIFEST_URL = '/agent-control/public/ui/mfe/manifest.json';

export interface InventoryDomain {
  id: string;
  label: string;
  labels?: Record<string, string>;
}

export const domainLabel = (
  domain: InventoryDomain,
  language: string,
): string => domain.labels?.[language] ?? domain.label;

export interface AgentControlInventory {
  script: string;
  elementName: string;
  agentsEvent?: string;
  domains: InventoryDomain[];
}

interface Manifest {
  version?: number;
  script?: string;
  elementName?: string;
  events?: {agentsLoaded?: string};
  domains?: InventoryDomain[];
}

const SUPPORTED_VERSION = 1;

let cached: AgentControlInventory | undefined;

const useAgentControlInventory = (): AgentControlInventory | undefined => {
  const [inventory, setInventory] = useState<AgentControlInventory | undefined>(
    cached,
  );

  useEffect(() => {
    if (cached) {
      return;
    }
    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch(MANIFEST_URL, {cache: 'no-store'});
        if (!response.ok) {
          return;
        }
        const manifest = (await response.json()) as Manifest;
        if (manifest.version !== SUPPORTED_VERSION) {
          return;
        }
        if (!manifest.script || !manifest.elementName) {
          return;
        }
        const discovered: AgentControlInventory = {
          script: manifest.script,
          elementName: manifest.elementName,
          agentsEvent: manifest.events?.agentsLoaded,
          domains: (manifest.domains ?? [])
            .filter(domain => Boolean(domain?.id) && Boolean(domain?.label))
            .map(domain => ({
              id: domain.id,
              label: domain.label,
              labels: domain.labels,
            })),
        };
        cached = discovered;
        if (!cancelled) {
          setInventory(discovered);
        }
      } catch {}
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return inventory;
};

export default useAgentControlInventory;
