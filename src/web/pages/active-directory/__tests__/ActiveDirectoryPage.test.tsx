/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {act, fireEvent, rendererWith, screen, userEvent} from 'web/testing';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import CredentialCommand from 'gmp/commands/credential';
import CredentialsCommand from 'gmp/commands/credentials';
import FiltersCommand from 'gmp/commands/filters';
import {
  AD_SOURCE,
  type DirectoryFixtureScenario,
} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import Response from 'gmp/http/response';
import {type DirectoryOverview} from 'gmp/models/active-directory';
import {createSession} from 'gmp/testing';
import DirectoryBrowser from 'web/pages/active-directory/DirectoryBrowser';

const createCommand = (scenario: DirectoryFixtureScenario = 'base') => {
  const command = new ActiveDirectoryCommand(createDirectoryHttp(scenario));
  return {
    getOverview: testing.fn(command.getOverview.bind(command)),
    getChildren: testing.fn(command.getChildren.bind(command)),
    resolveSubtree: testing.fn(command.resolveSubtree.bind(command)),
  };
};

const createGmp = (activedirectory: ReturnType<typeof createCommand>) => {
  const http = createDirectoryHttp();
  const credentials = new CredentialsCommand(http);
  return {
    activedirectory,
    credentials: {get: testing.fn(credentials.get.bind(credentials))},
    credential: new CredentialCommand(http),
    filters: new FiltersCommand(http),
    settings: {},
    session: createSession({token: 'directory-token'}),
  };
};

describe('Active Directory selection UI', () => {
  test('retries failed root and branch requests', async () => {
    const command = createCommand();
    command.getOverview.mockRejectedValueOnce(
      new Error('Active Directory unavailable'),
    );
    command.getChildren.mockRejectedValueOnce(
      new Error('Active Directory unavailable'),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} />);
    fireEvent.click(await screen.findByRole('button', {name: 'Retry'}));
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Clients'}),
    );
    fireEvent.click(await screen.findByRole('button', {name: 'Retry Clients'}));
    await screen.findByRole('button', {name: 'Expand Accounting'});
    expect(command.getOverview).toHaveBeenCalledTimes(2);
    expect(command.getChildren).toHaveBeenCalledTimes(2);
  });

  test('discards late branch responses after collapse and loads the latest response on reopen', async () => {
    const command = createCommand();
    let completeOldRequest: (
      response: Response<DirectoryOverview>,
    ) => void = () => {};
    command.getChildren.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          completeOldRequest = resolve;
        }),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} />);
    const disclosure = await screen.findByRole('button', {
      name: 'Expand Clients',
    });
    disclosure.focus();
    await userEvent.keyboard('{Enter}');
    expect(disclosure).toHaveFocus();
    expect(
      await screen.findByRole('status', {name: 'Loading Clients'}),
    ).toHaveAttribute('data-testid', 'loading');
    await userEvent.keyboard(' ');
    expect(disclosure).toHaveFocus();
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Enter}');
    expect(disclosure).toHaveFocus();
    await screen.findByRole('button', {name: 'Expand Accounting'});
    await act(async () =>
      completeOldRequest(
        new Response({roots: [], counts: {found: 0}, truncated: false}),
      ),
    );
    expect(
      screen.getByRole('button', {name: 'Expand Accounting'}),
    ).toBeInTheDocument();
  });

  test('fetches children afresh on every expansion without recursive discovery', async () => {
    const command = createCommand();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} />);
    await screen.findByRole('button', {name: 'Expand Clients'});
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    await screen.findByRole('button', {name: 'Expand Accounting'});
    expect(command.resolveSubtree).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Collapse Clients'}));
    expect(
      screen.queryByRole('button', {name: 'Expand Accounting'}),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    await screen.findByRole('button', {name: 'Expand Accounting'});
    expect(command.getChildren).toHaveBeenCalledTimes(2);
  });
});
