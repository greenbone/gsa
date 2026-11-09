/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useSyncExternalStore} from 'react';

export interface InventoryDomain {
  id: string;
  label: string;
  labels?: Record<string, string>;
}

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

type InventorySnapshot = AgentControlInventory | null | undefined;

export const domainLabel = (
  domain: InventoryDomain,
  language: string,
): string => domain.labels?.[language] ?? domain.label;

const MANIFEST_URL = '/agent-control/public/ui/mfe/manifest.json';
const SUPPORTED_VERSION = 1;

let cached: InventorySnapshot;
let discovery: Promise<void> | undefined;
const listeners = new Set<() => void>();
const getSnapshot = () => cached;
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const publish = (inventory: InventorySnapshot) => {
  cached = inventory;
  listeners.forEach(listener => listener());
};

const discover = () => {
  if (cached || discovery) {
    return;
  }
  // Defer the request until the shared promise is assigned.
  discovery = Promise.resolve().then(async () => {
    try {
      const response = await fetch(MANIFEST_URL, {cache: 'no-store'});
      if (!response.ok) {
        throw new Error('Inventory manifest request failed');
      }
      const manifest = (await response.json()) as Manifest;
      if (manifest.version !== SUPPORTED_VERSION) {
        throw new Error('Unsupported inventory manifest version');
      }
      if (!manifest.script || !manifest.elementName) {
        throw new Error('Invalid inventory manifest');
      }
      publish({
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
      });
    } catch {
      publish(null);
    } finally {
      discovery = undefined;
    }
  });
  publish(undefined);
};

const useAgentControlInventory = (): InventorySnapshot => {
  const inventory = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(() => {
    discover();
  }, []);
  return inventory;
};

export default useAgentControlInventory;
