/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeAll, describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, waitFor} from 'web/testing';
import {Route, Routes} from 'react-router';
import AgentControlMfePage from 'web/pages/agent-control-ui/AgentControlMfePage';

interface InventoryElement extends HTMLElement {
  getToken: () => Promise<string>;
}

const inventory = {
  script: '/inventory.js',
  elementName: 'test-agent-inventory',
  domains: [{id: 'network', label: 'Network'}],
};

vi.mock('web/hooks/useAgentControlInventory', () => ({
  default: () => inventory,
}));

beforeAll(() => {
  customElements.define(inventory.elementName, class extends HTMLElement {});
});

const mountInventory = async (
  getInventoryToken: ReturnType<typeof testing.fn>,
) => {
  const {render} = rendererWith({
    gmp: {agents: {getInventoryToken}},
    route: '/inventory/network',
  });
  const {container} = render(
    <Routes>
      <Route element={<AgentControlMfePage />} path="/inventory/:domain" />
    </Routes>,
  );
  await waitFor(() => {
    expect(container.querySelector(inventory.elementName)).not.toBeNull();
  });
  const element = container.querySelector<InventoryElement>(
    inventory.elementName,
  );
  if (!element) {
    throw new Error('Inventory element was not mounted');
  }
  return element;
};

describe('AgentControlMfePage inventory authentication', () => {
  test('should request a fresh token on each callback invocation', async () => {
    const getInventoryToken = testing
      .fn()
      .mockResolvedValueOnce({data: 'first-inventory-token'})
      .mockResolvedValueOnce({data: 'second-inventory-token'});
    const element = await mountInventory(getInventoryToken);

    expect(getInventoryToken).not.toHaveBeenCalled();
    await expect(element.getToken()).resolves.toBe('first-inventory-token');
    await expect(element.getToken()).resolves.toBe('second-inventory-token');
    expect(getInventoryToken).toHaveBeenCalledTimes(2);
    expect(element.outerHTML).not.toContain('inventory-token');
  });

  test('should propagate token issuance errors to the microfrontend', async () => {
    const error = new Error('Permission denied');
    const element = await mountInventory(testing.fn().mockRejectedValue(error));
    await expect(element.getToken()).rejects.toBe(error);
  });
});
