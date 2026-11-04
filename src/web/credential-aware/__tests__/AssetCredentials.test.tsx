/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait} from 'web/testing';
import {createSession} from 'gmp/testing';
import AssetCredentials from 'web/credential-aware/AssetCredentials';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('AssetCredentials review toggle', () => {
  test('pauses a saved override without deleting its credential', async () => {
    let enabled = true;
    const fetchMock = testing.fn(
      async (input: string, options?: RequestInit) => {
        const path = String(input);
        if (path.endsWith('/inventory')) {
          return new Response(
            JSON.stringify({
              targets: [],
              credentials: [{id: 'credential-a', name: 'SSH A', type: 'up'}],
              configs: [],
              scanners: [],
              assets: [],
            }),
            {status: 200},
          );
        }
        if (path.endsWith('/asset-overrides/toggle')) {
          const body = JSON.parse(
            typeof options?.body === 'string' ? options.body : '',
          ) as {enabled: boolean};
          enabled = body.enabled;
          return new Response(JSON.stringify({enabled}), {status: 200});
        }
        return new Response(
          JSON.stringify([
            {
              asset_id: 'asset-1',
              service: 'ssh',
              credential_id: 'credential-a',
              enabled,
            },
          ]),
          {status: 200},
        );
      },
    );
    globalThis.fetch = fetchMock as typeof globalThis.fetch;

    rendererWith({gmp: {session: createSession({token: 'test-token'})}}).render(
      <AssetCredentials assetId="asset-1" hostName="192.0.2.55" />,
    );
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Use SSH override for new scan groups',
    });
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    await wait();
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText('SSH A')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      '/credential-api/asset-overrides/toggle',
      expect.objectContaining({
        body: expect.stringContaining('"enabled":false'),
      }),
    );
  });
});
