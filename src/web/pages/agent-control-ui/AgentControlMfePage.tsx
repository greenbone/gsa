/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router';
import useAgentControlInventory from 'web/hooks/useAgentControlInventory';
import useTranslation from 'web/hooks/useTranslation';

const TOKEN_ENDPOINT = '/gvmd-sim/frontend-token';
const SCRIPT_ID = 'ac-inventory-mfe';

interface InventoryElement extends HTMLElement {
  getToken?: () => Promise<string>;
}

interface Agent {
  agentid: string;
  hostname: string;
}

let scriptLoad: Promise<void> | undefined;

const loadMfeScript = (src: string, elementName: string): Promise<void> => {
  if (customElements.get(elementName)) {
    return Promise.resolve();
  }
  if (!scriptLoad) {
    document.getElementById(SCRIPT_ID)?.remove();
    scriptLoad = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = src;
      script.addEventListener('load', () => resolve(), {once: true});
      script.addEventListener(
        'error',
        () => {
          script.remove();
          scriptLoad = undefined;
          reject(new Error('load failed'));
        },
        {once: true},
      );
      document.head.appendChild(script);
    });
  }
  return scriptLoad;
};

const fetchToken = async (): Promise<string> => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error(`token request failed: ${response.status}`);
  }
  const {token} = (await response.json()) as {token?: string};
  if (!token) {
    throw new Error('token missing from response');
  }
  return token;
};

const AgentControlMfePage = () => {
  const {domain} = useParams<{domain: string}>();
  const [_, i18n] = useTranslation();
  const language = i18n.language;
  const inventory = useAgentControlInventory();
  const isKnown = Boolean(
    inventory?.domains.some(known => known.id === domain),
  );
  const isStillDiscovering = inventory === undefined;
  const hostRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<InventoryElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (!inventory) {
          return;
        }
        await loadMfeScript(inventory.script, inventory.elementName);
        if (!cancelled) {
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          setHasFailed(true);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [inventory]);

  useEffect(() => {
    if (!isReady || !isKnown || !domain || !inventory) {
      return;
    }
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const element = document.createElement(
      inventory.elementName,
    ) as InventoryElement;
    // Keep the token off DOM attributes.
    element.getToken = fetchToken;
    element.addEventListener(
      inventory.agentsEvent ?? 'ac-inventory:agents',
      event => {
        const {agents: loaded} = (event as CustomEvent<{agents: Agent[]}>)
          .detail;
        setAgents(loaded ?? []);
      },
    );
    element.setAttribute('domain', domain);
    element.setAttribute('lang', language);
    if (selectedAgent) {
      element.setAttribute('agent', selectedAgent);
    }
    host.replaceChildren(element);
    elementRef.current = element;
    return () => {
      elementRef.current = null;
      host.replaceChildren();
    };
    // These are updated on the mounted element by separate effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, domain, isKnown, inventory]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }
    if (selectedAgent) {
      element.setAttribute('agent', selectedAgent);
    } else {
      element.removeAttribute('agent');
    }
  }, [selectedAgent]);

  useEffect(() => {
    elementRef.current?.setAttribute('lang', language);
  }, [language]);

  if (isStillDiscovering) {
    return <p>{_('Loading inventory pages…')}</p>;
  }
  if (!isKnown) {
    return <p>{_('Unknown inventory page.')}</p>;
  }
  if (hasFailed) {
    return <p>{_('Could not load the agent-control inventory module.')}</p>;
  }

  return (
    <div style={{width: '100%'}}>
      <label
        style={{display: 'block', marginBottom: '0.75rem'}}
        title="GSA's own control - it sets the agent attribute on the mounted element"
      >
        {_('Preset agent (set by GEA)')}{' '}
        <select
          value={selectedAgent}
          onChange={event => setSelectedAgent(event.target.value)}
        >
          <option value="">{_('All agents')}</option>
          {agents.map(agent => (
            <option key={agent.agentid} value={agent.agentid}>
              {agent.hostname} ({agent.agentid})
            </option>
          ))}
        </select>
      </label>
      <div ref={hostRef}>
        {!isReady && <p>{_('Loading inventory module…')}</p>}
      </div>
    </div>
  );
};

export default AgentControlMfePage;
