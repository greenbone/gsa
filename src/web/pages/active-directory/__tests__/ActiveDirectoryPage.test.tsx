/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {describe, expect, test, testing} from '@gsa/testing';
import {
  act,
  fireEvent,
  rendererWith,
  screen,
  userEvent,
  waitFor,
  within,
} from 'web/testing';
import {type QueryClient, useQueryClient} from '@tanstack/react-query';
import Capabilities from 'gmp/capabilities/capabilities';
import Features from 'gmp/capabilities/features';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import CredentialCommand from 'gmp/commands/credential';
import CredentialsCommand from 'gmp/commands/credentials';
import FiltersCommand from 'gmp/commands/filters';
import {
  AD_SOURCE,
  AD_OTHER_SOURCE,
  AD_CLIENTS,
  AD_ACCOUNTING,
  type DirectoryFixtureScenario,
} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import Response from 'gmp/http/response';
import {
  type DirectoryResolution,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import {createSession} from 'gmp/testing';
import ActiveDirectoryPage from 'web/pages/active-directory/ActiveDirectoryPage';
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
  test('browses containers only when enabled and keeps selected hosts when hidden', async () => {
    const command = createCommand();
    const onApply = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={onApply} />);
    await screen.findByRole('button', {name: 'Expand Clients'});
    const toggle = screen.getByRole('checkbox', {name: 'Show containers'});
    expect(toggle).not.toBeChecked();
    expect(
      screen.queryByRole('button', {name: 'Expand Computers'}),
    ).not.toBeInTheDocument();
    fireEvent.click(toggle);
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Computers'}),
    );
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Workstations'}),
    );
    fireEvent.click(
      await screen.findByRole('checkbox', {name: 'container-pc.domain.local'}),
    );
    fireEvent.click(toggle);
    await screen.findByRole('button', {name: 'Expand Clients'});
    expect(
      screen.queryByRole('button', {name: 'Expand Computers'}),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', {name: 'Add 1 hosts to new target'}),
    );
    expect(onApply).toHaveBeenCalledWith(['container-pc.domain.local']);
  });
  test('ignores recursive selection started before changing container visibility', async () => {
    const command = createCommand();
    const pendingResult = await command.resolveSubtree({
      sourceId: AD_SOURCE,
      branchId: AD_CLIENTS,
      kind: 'ou',
    });
    let completeSelection: (result: typeof pendingResult) => void = () => {};
    command.resolveSubtree.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          completeSelection = resolve;
        }),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Add 0 hosts to new target'}),
      ).toHaveAttribute('aria-busy', 'true'),
    );
    fireEvent.click(screen.getByRole('checkbox', {name: 'Show containers'}));
    await screen.findByRole('button', {name: 'Expand Computers'});
    await act(async () => completeSelection(pendingResult));
    expect(
      screen.getByRole('button', {name: 'Add 0 hosts to new target'}),
    ).toBeDisabled();
  });

  test('uses fresh branch edges after a recursive selection', async () => {
    const command = createCommand();
    const wire = new ActiveDirectoryCommand(createDirectoryHttp());
    command.getChildren.mockImplementation(async params => {
      const response = await wire.getChildren(params);
      if (params.branchId !== AD_ACCOUNTING) return response;
      const original = response.data.roots.find(
        node => node.kind === 'computer',
      );
      if (!original) throw new Error('Missing fixture computer');
      return response.setData({
        ...response.data,
        roots: [
          {
            ...original,
            id: 'CN=new-computer,' + AD_ACCOUNTING,
            name: 'new-computer.domain.local',
            hostname: 'new-computer.domain.local',
          },
        ],
      });
    });
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    await screen.findByRole('button', {name: 'Add 5 hosts to new target'});
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Accounting'}),
    );
    expect(
      await screen.findByRole('checkbox', {name: 'new-computer.domain.local'}),
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', {name: 'Accounting'}),
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', {name: 'Clients'}),
    ).toBePartiallyChecked();
    expect(
      screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
    ).toBeEnabled();
  });
  test('retries the connections list without starting discovery', async () => {
    const command = createCommand();
    const gmp = createGmp(command);
    gmp.credentials.get.mockRejectedValueOnce(new Error('Sources unavailable'));
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      features: new Features(['ENABLE_AD_INTEGRATION']),
    });
    render(<ActiveDirectoryPage />);
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Retry Active Directory credentials',
      }),
    );
    await screen.findByRole('link', {
      name: 'Open directory: AD Administration (dc01.domain.local)',
    });
    expect(gmp.credentials.get).toHaveBeenCalledTimes(2);
    expect(command.getOverview).not.toHaveBeenCalled();
  });

  test.each([
    {capabilities: true, features: new Features()},
    {capabilities: false, features: new Features(['ENABLE_AD_INTEGRATION'])},
  ])(
    'blocks direct page access when disabled or unauthorized: %j',
    async options => {
      const command = createCommand();
      const {render} = rendererWith({...options, gmp: createGmp(command)});
      render(<ActiveDirectoryPage />);
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Active Directory is not available.',
      );
      expect(command.getOverview).not.toHaveBeenCalled();
    },
  );

  test('requires target creation permission to apply a selection', async () => {
    const command = createCommand();
    const {render} = rendererWith({
      capabilities: new Capabilities(['get_targets']),
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    expect(
      await screen.findByRole('button', {name: 'Add 5 hosts to new target'}),
    ).toBeDisabled();
  });

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
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(await screen.findByRole('button', {name: 'Retry'}));
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Clients'}),
    );
    fireEvent.click(await screen.findByRole('button', {name: 'Retry Clients'}));
    await screen.findByRole('checkbox', {name: 'Accounting'});
    expect(command.getOverview).toHaveBeenCalledTimes(2);
    expect(command.getChildren).toHaveBeenCalledTimes(2);
  });

  test('preserves the previous selection on recursive failure and supports retry', async () => {
    const command = createCommand();
    command.resolveSubtree.mockRejectedValueOnce(
      new Error('Active Directory unavailable'),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Clients'}),
    );
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Accounting'}),
    );
    fireEvent.click(
      await screen.findByRole('checkbox', {name: 'pc-042.domain.local'}),
    );
    fireEvent.click(screen.getByRole('checkbox', {name: 'Clients'}));
    await screen.findByText(
      'Could not resolve the selected OU/group. Your selection has been preserved.',
    );
    expect(
      screen.getByRole('button', {name: 'Add 1 hosts to new target'}),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', {name: 'Add 1 hosts to new target'}),
    ).not.toHaveAttribute('data-loading');
    expect(
      screen.getByRole('checkbox', {name: 'pc-042.domain.local'}),
    ).toBeChecked();
    fireEvent.click(screen.getByRole('button', {name: 'Retry selection'}));
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
      ).toBeEnabled(),
    );
    expect(
      screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
    ).not.toHaveAttribute('data-loading');
    expect(
      screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
    ).toHaveAttribute('aria-busy', 'false');
    expect(command.resolveSubtree).toHaveBeenCalledTimes(2);
  });

  test('holds only active query data and clears inactive results and mutations', async () => {
    const command = createCommand();
    let client: QueryClient | undefined;
    const Probe = () => {
      const queryClient = useQueryClient();
      useEffect(() => {
        client = queryClient;
      }, [queryClient]);
      return null;
    };
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    const {unmount} = render(
      <>
        <Probe />
        <DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />
      </>,
    );
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
      ).toBeEnabled(),
    );
    expect(client?.getQueryCache().getAll()).toHaveLength(1);
    await waitFor(() =>
      expect(client?.getMutationCache().getAll()).toEqual([]),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    await screen.findByRole('checkbox', {name: 'Accounting'});
    expect(client?.getQueryCache().getAll()).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', {name: 'Collapse Clients'}));
    await waitFor(() =>
      expect(client?.getQueryCache().getAll()).toHaveLength(1),
    );
    unmount();
    await waitFor(() => expect(client?.getQueryCache().getAll()).toEqual([]));
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
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    const disclosure = await screen.findByRole('button', {
      name: 'Expand Clients',
    });
    disclosure.focus();
    await userEvent.keyboard('{Enter}');
    expect(disclosure).toHaveFocus();
    expect(
      await screen.findByRole('status', {name: 'Loading Clients'}),
    ).toBeVisible();
    expect(
      screen.queryByText('Loading directory objects...'),
    ).not.toBeInTheDocument();
    await userEvent.keyboard(' ');
    expect(disclosure).toHaveFocus();
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Enter}');
    expect(disclosure).toHaveFocus();
    await screen.findByRole('checkbox', {name: 'Accounting'});
    await act(async () =>
      completeOldRequest(
        new Response({roots: [], counts: {found: 0}, truncated: false}),
      ),
    );
    expect(
      screen.getByRole('checkbox', {name: 'Accounting'}),
    ).toBeInTheDocument();
  });

  test('clears selection on source changes and ignores a late recursive response', async () => {
    const command = createCommand();
    let completeSelection: (
      response: Response<DirectoryResolution>,
    ) => void = () => {};
    command.resolveSubtree.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          completeSelection = resolve;
        }),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    const {rerender} = render(
      <DirectoryBrowser
        key="administration"

        sourceId={AD_SOURCE}
        onApply={testing.fn()}
      />,
    );
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    const loadingButton = screen.getByRole('button', {
      name: 'Add 0 hosts to new target',
    });
    await waitFor(() =>
      expect(loadingButton).toHaveAttribute('aria-busy', 'true'),
    );
    expect(loadingButton).toHaveAttribute('data-loading', 'true');
    expect(loadingButton).toBeDisabled();
    expect(
      loadingButton.querySelector('.mantine-Button-loader'),
    ).toBeInTheDocument();

    rerender(
      <DirectoryBrowser
        key="engineering"

        sourceId={AD_OTHER_SOURCE}
        onApply={testing.fn()}
      />,
    );
    await screen.findByRole('checkbox', {name: 'Clients'});
    expect(
      screen.getByRole('button', {name: 'Add 0 hosts to new target'}),
    ).not.toHaveAttribute('data-loading');
    const computers = await new ActiveDirectoryCommand(
      createDirectoryHttp(),
    ).resolveSubtree({
      sourceId: AD_SOURCE,
      branchId: AD_CLIENTS,
      kind: 'ou' as const,
    });
    await act(async () => completeSelection(computers));
    expect(
      screen.getByRole('button', {name: 'Add 0 hosts to new target'}),
    ).toBeDisabled();
    expect(command.getOverview).toHaveBeenLastCalledWith({
      sourceId: AD_OTHER_SOURCE,
    });
    rerender(
      <DirectoryBrowser
        key="administration"
        sourceId={AD_SOURCE}
        onApply={testing.fn()}
      />,
    );
    await screen.findByRole('checkbox', {name: 'Clients'});
    expect(command.getOverview).toHaveBeenCalledTimes(3);
    expect(command.getOverview).toHaveBeenLastCalledWith({
      sourceId: AD_SOURCE,
    });
    expect(
      screen.getByRole('button', {name: 'Add 0 hosts to new target'}),
    ).toBeDisabled();
  });

  test('shows an empty directory without enabling apply', async () => {
    const command = createCommand();
    const overview: DirectoryOverview = {
      roots: [],
      counts: {
        found: 0,
        unresolvable: 0,
        disabled: 0,
        captured: 0,
        available: 0,
      },
      truncated: false,
    };
    command.getOverview.mockResolvedValue(new Response(overview));
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    expect(
      (await screen.findByText('No visible directory objects.')).closest(
        'output',
      ),
    ).toHaveRole('status');
    expect(
      screen.getByRole('button', {name: 'Add 0 hosts to new target'}),
    ).toBeDisabled();
  });

  test('fetches children afresh on every expansion without recursive discovery', async () => {
    const command = createCommand();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    await screen.findByRole('checkbox', {name: 'Clients'});
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    await screen.findByRole('checkbox', {name: 'Accounting'});
    expect(command.resolveSubtree).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', {name: 'Collapse Clients'}));
    expect(
      screen.queryByRole('checkbox', {name: 'Accounting'}),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    await screen.findByRole('checkbox', {name: 'Accounting'});
    expect(command.getChildren).toHaveBeenCalledTimes(2);
  });

  test('resolves an unloaded subtree and applies without inventing a quota check', async () => {
    const command = createCommand();
    const onApply = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={onApply} />);
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    expect(command.getChildren).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
      ).toBeEnabled(),
    );
    expect(command.resolveSubtree).toHaveBeenCalledWith({
      sourceId: AD_SOURCE,
      branchId: AD_CLIENTS,
      kind: 'ou',
    });
    fireEvent.click(
      screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
    );
    expect(onApply).toHaveBeenCalledWith([
      'pc-042.domain.local',
      'pc-043.domain.local',
      'pc-legacy.domain.local',
      'fs-01.domain.local',
      'fs-02.domain.local',
    ]);
  });

  test('allows deselecting captured and unresolved computers and shows partial parents', async () => {
    const command = createCommand();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    await waitFor(() =>
      expect(
        screen.getByRole('button', {name: 'Add 5 hosts to new target'}),
      ).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Accounting'}),
    );
    const captured = await screen.findByRole('checkbox', {
      name: 'pc-043.domain.local',
    });
    const unresolved = screen.getByRole('checkbox', {
      name: 'pc-legacy.domain.local',
    });
    expect(captured).toBeChecked();
    expect(unresolved).toBeChecked();
    fireEvent.click(captured);
    fireEvent.click(unresolved);
    expect(
      screen.getByRole('checkbox', {name: 'Accounting'}),
    ).toBePartiallyChecked();
    expect(
      screen.getByRole('checkbox', {name: 'Clients'}),
    ).toBePartiallyChecked();
    expect(
      screen.getByRole('button', {name: 'Add 3 hosts to new target'}),
    ).toBeEnabled();
    expect(
      screen.queryByRole('checkbox', {name: 'pc-retired.domain.local'}),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Show disabled Active Directory objects',
      }),
    );
    fireEvent.click(
      screen.getByRole('checkbox', {name: 'pc-retired.domain.local'}),
    );
    expect(
      screen.getByRole('button', {name: 'Add 4 hosts to new target'}),
    ).toBeEnabled();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Show disabled Active Directory objects',
      }),
    );
    expect(
      screen.getByRole('button', {name: 'Add 3 hosts to new target'}),
    ).toBeEnabled();
  });
  test('updates all summary cards from loaded computers and keeps missing hostnames unselectable', async () => {
    const command = createCommand();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    await screen.findByRole('checkbox', {name: 'Clients'});
    const summary = screen.getByRole('group', {name: 'Discovery summary'});
    expect(
      within(summary)
        .getAllByRole('definition')
        .map(value => value.textContent),
    ).toEqual(['2', 'Unavailable', '0', '0', '2']);
    fireEvent.click(screen.getByRole('button', {name: 'Expand Clients'}));
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Accounting'}),
    );
    expect(
      await screen.findByRole('checkbox', {name: 'no-hostname.domain.local'}),
    ).toBeDisabled();
    await waitFor(() =>
      expect(
        within(summary)
          .getAllByRole('definition')
          .map(value => value.textContent),
      ).toEqual(['7', 'Unavailable', '1', '1', '5']),
    );
    expect(screen.queryByText('Unresolvable hostname')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Show disabled Active Directory objects',
      }),
    );
    expect(
      within(summary)
        .getAllByRole('definition')
        .map(value => value.textContent),
    ).toEqual(['7', 'Unavailable', '0', '1', '6']);
  });

  test('retains partial parent selection after collapsing an individually selected child', async () => {
    const command = createCommand();
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Clients'}),
    );
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Accounting'}),
    );
    fireEvent.click(
      await screen.findByRole('checkbox', {name: 'pc-042.domain.local'}),
    );
    expect(
      screen.getByRole('checkbox', {name: 'Accounting'}),
    ).toBePartiallyChecked();
    expect(
      screen.getByRole('checkbox', {name: 'Clients'}),
    ).toBePartiallyChecked();
    fireEvent.click(screen.getByRole('button', {name: 'Collapse Clients'}));
    expect(
      screen.getByRole('checkbox', {name: 'Clients'}),
    ).toBePartiallyChecked();
    expect(
      screen.getByRole('button', {name: 'Add 1 hosts to new target'}),
    ).toBeEnabled();
  });

  test('identifies an incomplete root and allows selection of a loaded computer', async () => {
    const command = createCommand();
    const wireCommand = new ActiveDirectoryCommand(createDirectoryHttp());
    command.getOverview.mockResolvedValueOnce(
      await wireCommand.getObjects({sourceId: AD_SOURCE, maxResults: 2}),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    const region = await screen.findByRole('region', {
      name: 'Directory objects',
    });
    expect(await within(region).findByRole('status')).toHaveTextContent(
      'Directory root: some objects were not returned.',
    );
    expect(screen.getByText('Loaded computers')).toBeVisible();
    const summary = screen.getByRole('group', {name: 'Discovery summary'});
    expect(within(summary).getAllByRole('definition')[0]).toHaveTextContent(
      '1',
    );
    fireEvent.click(screen.getByRole('checkbox', {name: 'fs-01.domain.local'}));
    expect(
      screen.getByRole('button', {name: 'Add 1 hosts to new target'}),
    ).toBeEnabled();
    expect(command.getOverview).toHaveBeenCalledTimes(1);
    expect(command.getChildren).not.toHaveBeenCalled();
    expect(command.resolveSubtree).not.toHaveBeenCalled();
  });

  test('warns about truncated browsing without claiming a complete branch selection', async () => {
    const command = createCommand();
    const listing = (
      await command.getChildren({
        sourceId: AD_SOURCE,
        branchId: AD_CLIENTS,
        kind: 'ou',
      })
    ).data;
    command.getChildren.mockClear();
    command.getChildren.mockResolvedValueOnce(
      new Response({...listing, truncated: true}),
    );
    const {render} = rendererWith({
      capabilities: true,
      gmp: createGmp(command),
    });
    render(<DirectoryBrowser sourceId={AD_SOURCE} onApply={testing.fn()} />);
    fireEvent.click(
      await screen.findByRole('button', {name: 'Expand Clients'}),
    );
    await waitFor(() =>
      expect(
        screen.getAllByText(
          'Clients: some objects were not returned. You can select the loaded computers.',
        ).length,
      ).toBeGreaterThan(0),
    );
    expect(screen.getByRole('checkbox', {name: 'Clients'})).not.toBeChecked();
    expect(command.resolveSubtree).not.toHaveBeenCalled();
  });
});
