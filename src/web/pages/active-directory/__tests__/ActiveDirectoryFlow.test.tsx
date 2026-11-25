/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor, within} from 'web/testing';
import {Route, Routes, useNavigate} from 'react-router';
import Capabilities from 'gmp/capabilities/capabilities';
import Features from 'gmp/capabilities/features';
import CollectionCounts from 'gmp/collection/collection-counts';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import CredentialCommand from 'gmp/commands/credential';
import CredentialsCommand from 'gmp/commands/credentials';
import FiltersCommand from 'gmp/commands/filters';
import {
  AD_SOURCE,
  AD_OTHER_SOURCE,
  AD_BASE,
} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import Response from 'gmp/http/response';
import Credential from 'gmp/models/credential';
import QueryFilter from 'gmp/models/filter/query-filter';
import {filterString} from 'gmp/models/filter/utils';
import {createSession} from 'gmp/testing';
import ActiveDirectoryBrowserPage from 'web/pages/active-directory/ActiveDirectoryBrowserPage';
import ActiveDirectoryPage from 'web/pages/active-directory/ActiveDirectoryPage';
import {ROUTES} from 'web/route-paths';

const BrowserHistory = () => {
  const navigate = useNavigate();
  return <button onClick={() => void navigate(-1)}>Browser back</button>;
};

const setup = (
  route = '/active-directory',
  capabilities: boolean | Capabilities = true,
  features = new Features(['ENABLE_AD_INTEGRATION']),
) => {
  const http = createDirectoryHttp();
  const command = new ActiveDirectoryCommand(http);
  const credentials = new CredentialsCommand(http);
  const credential = new CredentialCommand(http);
  const gmp = {
    settings: {},
    session: createSession({token: 'ad-flow-token'}),
    credentials: {get: testing.fn(credentials.get.bind(credentials))},
    credential: {get: testing.fn(credential.get.bind(credential))},
    filters: new FiltersCommand(http),
    activedirectory: {
      getOverview: testing.fn(command.getOverview.bind(command)),
      getChildren: testing.fn(command.getChildren.bind(command)),
      resolveSubtree: testing.fn(command.resolveSubtree.bind(command)),
    },
  };
  const {render} = rendererWith({
    route,
    capabilities,
    features,
    gmp,
  });
  const renderPages = () =>
    render(
      <>
        <BrowserHistory />
        <Routes>
          <Route
            element={<ActiveDirectoryPage />}
            path={ROUTES.activeDirectory.path}
          />
          <Route
            element={<ActiveDirectoryBrowserPage />}
            path={ROUTES.activeDirectoryBrowser.path}
          />
        </Routes>
      </>,
    );
  return {gmp, renderPages};
};

const openAdministration = () =>
  screen.findByRole('link', {
    name: 'Open directory: AD Administration (dc01.domain.local)',
  });

describe('Active Directory two-page flow', () => {
  test('shows metadata and pagination without discovering directory objects', async () => {
    const {gmp, renderPages} = setup();
    renderPages();
    const table = await screen.findByRole('table', {
      name: 'Active Directory connections',
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(within(table).getByText('dc01.domain.local:636')).toBeVisible();
    expect(within(table).getAllByText(AD_BASE).length).toBeGreaterThan(0);
    expect(within(table).getAllByText('LDAPS').length).toBeGreaterThan(0);
    expect(within(table).getByText('StartTLS')).toBeVisible();
    expect(gmp.activedirectory.getOverview).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByTitle('Next')[0]);
    await screen.findByRole('link', {name: 'Open directory: AD Site 50'});
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('first=51');
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('type=ad');
    expect(
      screen.queryByRole('link', {
        name: 'Open directory: AD Administration (dc01.domain.local)',
      }),
    ).not.toBeInTheDocument();
  });

  test('expands the credential preview without browsing the directory', async () => {
    const {gmp, renderPages} = setup();
    renderPages();
    const action = await openAdministration();
    expect(action).toHaveAttribute('title', 'Open directory');
    expect(
      within(action).getByTestId('active-directory-icon'),
    ).toBeInTheDocument();
    expect(action).toHaveTextContent('');
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Show preview for AD Administration (dc01.domain.local)',
      }),
    );
    expect(await screen.findByText('Bind DN')).toBeVisible();
    expect(screen.getByText('Active Directory Host or Address')).toBeVisible();
    expect(screen.getByText('Port', {exact: true})).toBeVisible();
    expect(screen.getByTitle('Open all details').closest('a')).toHaveAttribute(
      'href',
      ROUTES.credential.url(AD_SOURCE),
    );
    expect(gmp.activedirectory.getOverview).not.toHaveBeenCalled();
    expect(gmp.credential.get).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Hide preview for AD Administration (dc01.domain.local)',
      }),
    );
    expect(screen.queryByText('Bind DN')).not.toBeInTheDocument();
  });

  test('keeps filter and page when returning and starts a fresh host selection', async () => {
    const search = new URLSearchParams({
      filter: 'name~AD rows=2 first=3 sort=name',
    }).toString();
    const {gmp, renderPages} = setup(`/active-directory?${search}`);
    renderPages();
    fireEvent.click(
      await screen.findByRole('link', {name: 'Open directory: AD Site 01'}),
    );
    await screen.findByRole('heading', {
      name: /AD Site 01/,
    });
    expect(
      screen.queryByRole('combobox', {name: 'AD credentials'}),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    await screen.findByText('5 hosts selected');
    fireEvent.click(screen.getByRole('button', {name: 'Browser back'}));
    fireEvent.click(
      await screen.findByRole('link', {name: 'Open directory: AD Site 01'}),
    );
    await screen.findByRole('checkbox', {name: 'Clients'});
    expect(
      screen.getByRole('button', {name: 'Add hosts to new target'}),
    ).toBeDisabled();
    expect(gmp.activedirectory.getOverview).toHaveBeenCalledTimes(2);
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('name~AD');
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('rows=2');
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('first=3');
  });

  test('opens a direct link without fetching the connections list', async () => {
    const {gmp, renderPages} = setup(
      ROUTES.activeDirectoryBrowser.url(AD_OTHER_SOURCE),
    );
    renderPages();
    await screen.findByRole('checkbox', {name: 'Clients'});
    expect(gmp.credential.get).toHaveBeenCalledWith({id: AD_OTHER_SOURCE});
    expect(gmp.credentials.get).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('link', {name: 'Back to connections'}),
    ).not.toBeInTheDocument();
  });

  test('filters through the standard toolbar and keeps the AD scope on reset', async () => {
    const {gmp, renderPages} = setup();
    renderPages();
    await openAdministration();
    const input = screen.getByTestId('powerfilter-text');
    fireEvent.change(input, {target: {value: 'name~Engineering'}});
    fireEvent.click(screen.getByTitle('Update Filter'));
    await screen.findByRole('link', {
      name: 'Open directory: AD Engineering (dc02.domain.local)',
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('link', {
          name: 'Open directory: AD Administration (dc01.domain.local)',
        }),
      ).not.toBeInTheDocument(),
    );
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('type=ad and name~Engineering');
    fireEvent.click(screen.getByTitle('Reset to Default Filter'));
    await openAdministration();
    expect(
      filterString(gmp.credentials.get.mock.lastCall?.[0]?.filter),
    ).toContain('type=ad');
    expect(gmp.activedirectory.getOverview).not.toHaveBeenCalled();
  });

  test('filters AD connection names with unqualified powerfilter terms', async () => {
    const {renderPages} = setup();
    renderPages();
    await screen.findByRole('table', {name: 'Active Directory connections'});
    fireEvent.change(screen.getByTestId('powerfilter-text'), {
      target: {value: 'site 01'},
    });
    fireEvent.click(screen.getByTitle('Update Filter'));
    await screen.findByRole('link', {name: 'Open directory: AD Site 01'});
    expect(
      screen.queryByRole('link', {
        name: 'Open directory: AD Administration (dc01.domain.local)',
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {name: 'Open directory: AD Site 02'}),
    ).not.toBeInTheDocument();
  });

  test('distinguishes empty credentials from no filter matches', async () => {
    const {gmp, renderPages} = setup();
    gmp.credentials.get.mockResolvedValueOnce(
      new Response([], {
        counts: new CollectionCounts(),
        filter: QueryFilter.fromString(),
      }),
    );
    renderPages();
    await screen.findByText('No Active Directory credentials available.');
    expect(
      screen.getByRole('link', {name: 'Manage credentials'}),
    ).toHaveAttribute('href', ROUTES.credentials.url);
  });

  test('shows a clear-filter action when a search has no matches', async () => {
    const {renderPages} = setup('/active-directory?filter=name~missing');
    renderPages();
    await screen.findByText(
      'No Active Directory credentials match this filter.',
    );
    fireEvent.click(screen.getByRole('button', {name: 'Clear filter'}));
    await openAdministration();
  });

  test.each(['missing', 'non-ad'])(
    'blocks discovery for an unavailable credential (%s)',
    async kind => {
      const {gmp, renderPages} = setup(
        ROUTES.activeDirectoryBrowser.url(AD_SOURCE),
      );
      if (kind === 'missing')
        gmp.credential.get.mockRejectedValue(new Error('Not found'));
      else
        gmp.credential.get.mockResolvedValue(
          new Response(
            new Credential({id: AD_SOURCE, credentialType: 'up', name: 'SSH'}),
          ),
        );
      renderPages();
      await screen.findByRole('button', {name: 'Retry credential'});
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Could not load this Active Directory credential.',
      );
      expect(gmp.activedirectory.getOverview).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('link', {name: 'Back to connections'}),
      ).not.toBeInTheDocument();
    },
  );

  test('retries loading a credential before querying the directory', async () => {
    const {gmp, renderPages} = setup(
      ROUTES.activeDirectoryBrowser.url(AD_SOURCE),
    );
    gmp.credential.get.mockRejectedValueOnce(new Error('Unavailable'));
    renderPages();
    fireEvent.click(
      await screen.findByRole('button', {name: 'Retry credential'}),
    );
    await screen.findByRole('checkbox', {name: 'Clients'});
    expect(gmp.credential.get).toHaveBeenCalledTimes(2);
    expect(gmp.activedirectory.getOverview).toHaveBeenCalledTimes(1);
  });

  test('lets delegated users browse without target access or creation permission', async () => {
    const {gmp, renderPages} = setup(
      ROUTES.activeDirectory.url,
      new Capabilities(['get_active_directory_objects', 'get_credentials']),
    );
    renderPages();
    fireEvent.click(await openAdministration());
    fireEvent.click(await screen.findByRole('checkbox', {name: 'Clients'}));
    await screen.findByText('5 hosts selected');
    expect(
      screen.getByRole('button', {name: 'Add hosts to new target'}),
    ).toBeDisabled();
    expect(gmp.credentials.get).toHaveBeenCalled();
    expect(gmp.credential.get).toHaveBeenCalledWith({id: AD_SOURCE});
    expect(gmp.activedirectory.getOverview).toHaveBeenCalledTimes(1);
  });

  describe.each([
    ROUTES.activeDirectory.url,
    ROUTES.activeDirectoryBrowser.url(AD_SOURCE),
  ])('direct Active Directory access at %s', route => {
    test.each([
      ['target access only', new Capabilities(['get_targets']), true],
      ['credential access only', new Capabilities(['get_credentials']), true],
      [
        'discovery access only',
        new Capabilities(['get_active_directory_objects']),
        true,
      ],
      ['feature disabled', true, false],
    ] as const)(
      'blocks %s before making any Active Directory requests',
      (_scenario, capabilities, enabled) => {
        const features = new Features(enabled ? ['ENABLE_AD_INTEGRATION'] : []);
        const {gmp, renderPages} = setup(route, capabilities, features);
        renderPages();
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Active Directory is not available.',
        );
        expect(gmp.credentials.get).not.toHaveBeenCalled();
        expect(gmp.credential.get).not.toHaveBeenCalled();
        expect(gmp.activedirectory.getOverview).not.toHaveBeenCalled();
      },
    );
  });
});
