/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import {AD_SOURCE, AD_ACCOUNTING} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import Response from 'gmp/http/response';
import {type DirectoryComputer} from 'gmp/models/active-directory';
import {createSession} from 'gmp/testing';
import ComputerDetails from 'web/pages/active-directory/ComputerDetails';
import ComputerRelationships from 'web/pages/active-directory/ComputerRelationships';
import ComputerRow from 'web/pages/active-directory/ComputerRow';
import DirectoryTree from 'web/pages/active-directory/DirectoryTree';

const createDetailsGmp = (
  getComputerDetails: ActiveDirectoryCommand['getComputerDetails'],
) => ({
  settings: {},
  session: createSession({token: 'ad-details-token'}),
  activedirectory: {getComputerDetails},
});

describe('Computer relationship table', () => {
  test('shows a concise summary without a table for zero matches', async () => {
    const command = new ActiveDirectoryCommand(
      createDirectoryHttp('relationships'),
    );
    const result = await command.getChildren({
      sourceId: AD_SOURCE,
      branchId: AD_ACCOUNTING,
      kind: 'ou',
      maxResults: 100,
    });
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createDetailsGmp(command.getComputerDetails.bind(command)),
    });
    render(
      <DirectoryTree
        knownMembers={{}}
        memberships={{}}
        nodes={result.data.roots}
        selectedIds={new Set()}
        selectionPending={false}
        showDisabled={false}
        sourceId={AD_SOURCE}
        onLoaded={testing.fn()}
        onSelect={testing.fn()}
      />,
    );
    const row = screen
      .getByRole('checkbox', {name: 'pc-no-target.domain.local'})
      .closest('li') as HTMLElement;
    expect(
      within(row).getByText('No matching readable scan targets'),
    ).toBeVisible();
    expect(within(row).queryByRole('table')).not.toBeInTheDocument();
    const details = within(row).getByRole('button', {
      name: 'Computer details for pc-no-target.domain.local',
    });
    fireEvent.click(details);
    expect(within(row).getByText('Active Directory information')).toBeVisible();
    expect(within(row).getByText('Distinguished name')).toBeVisible();
    expect(await within(row).findByText('10.0 (22631)')).toBeVisible();
    expect(within(row).getByText('OS version')).toBeVisible();
    expect(within(row).getByText('HOST/example.domain.local')).toBeVisible();
    expect(
      within(row).getByText(
        'CN=pc-no-target,OU=Accounting,OU=Clients,DC=domain,DC=local',
      ),
    ).toBeVisible();
  });

  test.each([
    {spns: ['HOST/workstation', 'HTTP/workstation'], empty: false},
    {spns: [], empty: true},
    {spns: undefined, empty: false},
  ])(
    'displays reported SPNs in the computer details ($spns)',
    ({spns, empty}) => {
      const {render} = rendererWith({capabilities: true, router: true});
      render(
        <ComputerDetails
          details={{servicePrincipalNames: spns}}
          node={{
            id: 'computer',
            kind: 'computer',
            name: 'workstation',
            parentDn: '',
            disabled: false,
          }}
        />,
      );
      const details = within(
        screen.getByRole('table', {name: 'Active Directory information'}),
      );
      if (spns === undefined) {
        expect(
          details.queryByText('Service principal names (SPNs)'),
        ).not.toBeInTheDocument();
        return;
      }
      expect(details.getByText('Service principal names (SPNs)')).toBeVisible();
      if (empty) {
        expect(details.getByText('No SPNs registered')).toBeVisible();
      } else {
        expect(
          details.getAllByRole('listitem').map(item => item.textContent),
        ).toEqual(spns);
        expect(
          details.getByText(
            'SPNs can indicate service roles, but may be incomplete.',
          ),
        ).toBeVisible();
      }
    },
  );

  test('shows relationship names as plain text without detail permissions', () => {
    const {render} = rendererWith({capabilities: false, router: true});
    render(
      <ComputerRelationships
        node={{
          id: 'computer',
          kind: 'computer',
          name: 'workstation',
          parentDn: '',
          disabled: false,
          matchedTargets: [
            {
              id: 'target',
              name: 'Office network',
              tasks: [
                {
                  id: 'task',
                  name: 'Weekly scan',
                  config: {id: 'config', name: 'Full and fast'},
                },
              ],
            },
          ],
        }}
      />,
    );
    expect(screen.getByText('Office network')).toBeVisible();
    expect(screen.getByText('Weekly scan')).toBeVisible();
    expect(screen.getByText('Full and fast')).toBeVisible();
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
  test('shows target, task, and config columns without changing selection', async () => {
    const http = createDirectoryHttp('relationships');
    const command = new ActiveDirectoryCommand(http);
    const result = await command.getChildren({
      sourceId: AD_SOURCE,
      branchId: AD_ACCOUNTING,
      kind: 'ou',
      maxResults: 100,
    });
    const onSelect = testing.fn();
    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createDetailsGmp(command.getComputerDetails.bind(command)),
    });
    render(
      <DirectoryTree
        knownMembers={{}}
        memberships={{}}
        nodes={result.data.roots}
        selectedIds={new Set()}
        selectionPending={false}
        showDisabled={false}
        sourceId={AD_SOURCE}
        onLoaded={testing.fn()}
        onSelect={onSelect}
      />,
    );
    const row = screen
      .getByRole('checkbox', {name: 'pc-multiple-targets.domain.local'})
      .closest('li') as HTMLElement;
    const disclosure = within(row).getByRole('button', {
      name: /Computer details for pc-multiple-targets/,
    });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(within(row).queryByRole('table')).not.toBeInTheDocument();
    expect(http.request).toHaveBeenCalledTimes(1);
    disclosure.focus();
    await userEvent.keyboard('{Enter}');
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      document.getElementById(disclosure.getAttribute('aria-controls') ?? ''),
    ).toBeVisible();
    const officeNetworkLinks = within(row).getAllByRole('link', {
      name: 'Office network',
    });
    expect(officeNetworkLinks).toHaveLength(1);
    expect(officeNetworkLinks[0]).toHaveAttribute(
      'href',
      '/target/1f28d970-17ef-4c69-ba8a-13827059f2b9',
    );
    expect(
      within(row).getByRole('columnheader', {name: 'Scan target'}),
    ).toHaveAttribute('scope', 'col');
    expect(
      within(row).getAllByRole('link', {name: 'Office network'}),
    ).toHaveLength(1);
    expect(
      within(row).getByRole('link', {name: 'Weekly workstation scan'}),
    ).toBeVisible();
    expect(
      within(row).getByRole('link', {name: 'Daily discovery'}),
    ).toBeVisible();
    expect(
      within(row).getByRole('link', {name: 'Full and fast'}),
    ).toBeVisible();
    expect(within(row).getByRole('link', {name: 'Discovery'})).toBeVisible();
    expect(within(row).getByText('No readable tasks assigned')).toBeVisible();
    expect(within(row).queryByText('Story 4')).not.toBeInTheDocument();
    expect(within(row).queryByText('Story 8')).not.toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
    expect(http.request).toHaveBeenCalledTimes(2);
    fireEvent.click(within(row).getByRole('checkbox'));
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({name: 'pc-multiple-targets.domain.local'}),
      true,
      undefined,
    );
    for (const button of screen.getAllByRole('button', {
      name: /Computer details for/,
    })) {
      if (button !== disclosure) fireEvent.click(button);
    }
    expect(
      within(row).getByRole('table', {
        name: 'Existing scan-target assignments',
      }),
    ).toBeVisible();
    expect(screen.getByText('Task information unavailable')).toBeVisible();
    expect(screen.getByText('Scan configuration unavailable')).toBeVisible();
    const unknown = screen
      .getByRole('checkbox', {name: 'pc-matching-unavailable.domain.local'})
      .closest('li') as HTMLElement;
    expect(
      within(unknown).getAllByText('Matching information unavailable')[0],
    ).toBeVisible();
    expect(
      within(unknown).getByRole('button', {name: /Computer details for/}),
    ).toBeVisible();
    disclosure.focus();
    await userEvent.keyboard(' ');
    expect(disclosure).toHaveFocus();
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(within(row).queryByRole('table')).not.toBeInTheDocument();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(within(row).getAllByRole('button')).toHaveLength(1);
    fireEvent.click(within(row).getByText('pc-multiple-targets.domain.local'));
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(onSelect).toHaveBeenCalledTimes(1);
    disclosure.focus();
    await userEvent.keyboard(' ');
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

test('keeps details available for computers without a hostname or optional Active Directory attributes', async () => {
  const onSelect = testing.fn();
  const node: DirectoryComputer = {
    id: 'CN=missing,DC=domain,DC=local',
    kind: 'computer',
    name: 'missing',
    parentDn: 'DC=domain,DC=local',
    disabled: false,
  };
  const getComputerDetails = testing.fn().mockResolvedValue(new Response(node));
  const {render} = rendererWith({
    capabilities: true,
    router: true,
    gmp: createDetailsGmp(getComputerDetails),
  });
  render(
    <ul>
      <ComputerRow
        checked={false}
        node={node}
        selectionPending={false}
        sourceId={AD_SOURCE}
        onSelect={onSelect}
      />
    </ul>,
  );
  expect(screen.getByRole('checkbox', {name: 'missing'})).toBeDisabled();
  const badge = screen.getByText('No DNS hostname', {exact: true});
  expect(badge).toBeVisible();
  const hostnameHelp = 'This computer cannot be transferred to a target.';
  expect(
    screen.queryByRole('button', {name: hostnameHelp}),
  ).not.toBeInTheDocument();
  const disclosure = screen.getByRole('button', {
    name: 'Computer details for missing',
  });
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  disclosure.focus();
  await userEvent.tab();
  expect(badge.closest('[tabindex="0"]')).toHaveFocus();
  expect(await screen.findByRole('tooltip')).toHaveTextContent(hostnameHelp);
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
  );
  expect(badge.closest('[tabindex="0"]')).toHaveFocus();
  await userEvent.tab();
  await userEvent.hover(badge);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(hostnameHelp);
  await userEvent.unhover(badge);
  await waitFor(() =>
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
  );
  expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(disclosure);
  const panel = screen.getByRole('region', {
    name: 'Computer details for missing',
  });
  expect(within(panel).queryByText(hostnameHelp)).not.toBeInTheDocument();
  const versionRow = within(panel).getByRole('row', {name: /OS version/});
  expect(await within(versionRow).findByText('Not provided')).toBeVisible();
  expect(within(panel).getAllByText('Not provided')).toHaveLength(3);
  expect(
    within(panel).getByText('CN=missing,DC=domain,DC=local'),
  ).toBeVisible();
  expect(
    within(panel).getByText('Matching information unavailable'),
  ).toBeVisible();
  expect(within(panel).getByText('Description')).toBeVisible();
  expect(within(panel).getByText(/may contain personal data/)).toBeVisible();
  expect(onSelect).not.toHaveBeenCalled();
});

test('keeps selection and target links usable during a details failure and retries on demand', async () => {
  const node: DirectoryComputer = {
    id: `CN=pc-043,${AD_ACCOUNTING}`,
    kind: 'computer',
    name: 'workstation',
    parentDn: AD_ACCOUNTING,
    hostname: 'pc-043.domain.local',
    disabled: false,
    operatingSystem: 'Windows 11',
    matchedTargets: [{id: 'office', name: 'Office network'}],
  };
  let failDetails!: (error: Error) => void;
  const pendingDetails = new Promise<Response<DirectoryComputer>>(
    (_, reject) => {
      failDetails = reject;
    },
  );
  let completeRetry!: (response: Response<DirectoryComputer>) => void;
  const retryDetails = new Promise<Response<DirectoryComputer>>(resolve => {
    completeRetry = resolve;
  });
  const details = new Response({
    ...node,
    operatingSystemVersion: '22631',
    servicePrincipalNames: ['HOST/pc-043.domain.local'],
  });
  const getComputerDetails = testing
    .fn()
    .mockReturnValueOnce(pendingDetails)
    .mockReturnValueOnce(retryDetails)
    .mockResolvedValue(details);
  const onSelect = testing.fn();
  const {render} = rendererWith({
    capabilities: true,
    router: true,
    gmp: createDetailsGmp(getComputerDetails),
  });
  render(
    <ul>
      <ComputerRow
        checked={false}
        node={node}
        selectionPending={false}
        sourceId={AD_SOURCE}
        onSelect={onSelect}
      />
    </ul>,
  );
  expect(getComputerDetails).not.toHaveBeenCalled();
  const disclosure = screen.getByRole('button', {
    name: 'Computer details for workstation',
  });
  fireEvent.click(disclosure);
  const panel = within(
    screen.getByRole('region', {name: 'Computer details for workstation'}),
  );
  const versionRow = within(panel.getByRole('row', {name: /OS version/}));
  expect(
    versionRow.getByRole('status', {name: 'Loading computer details...'}),
  ).toHaveTextContent('Loading...');
  expect(
    panel.getByRole('row', {name: /Service principal names/}),
  ).toHaveTextContent('Loading...');
  expect(panel.queryByTestId('loading')).not.toBeInTheDocument();
  expect(panel.getByText('Windows 11')).toBeVisible();
  expect(panel.getByRole('link', {name: 'Office network'})).toBeVisible();
  expect(getComputerDetails).toHaveBeenCalledTimes(1);
  await act(async () => failDetails(new Error('Computer moved')));
  expect(await panel.findByRole('alert')).toHaveTextContent(
    'Could not load computer details.',
  );
  expect(panel.queryByRole('status')).not.toBeInTheDocument();
  expect(panel.getByRole('link', {name: 'Office network'})).toHaveAttribute(
    'href',
    '/target/office',
  );
  fireEvent.click(screen.getByRole('checkbox', {name: 'workstation'}));
  expect(onSelect).toHaveBeenCalledWith(true);
  const retry = panel.getByRole('button', {name: 'Retry'});
  fireEvent.click(retry);
  await waitFor(() => expect(retry).toBeDisabled());
  expect(panel.queryByRole('status')).not.toBeInTheDocument();
  await act(async () => completeRetry(details));
  expect(await panel.findByText('22631')).toBeVisible();
  expect(panel.getByText('HOST/pc-043.domain.local')).toBeVisible();
  expect(panel.queryByRole('status')).not.toBeInTheDocument();
  expect(panel.queryByRole('alert')).not.toBeInTheDocument();
  expect(getComputerDetails).toHaveBeenCalledTimes(2);
  fireEvent.click(disclosure);
  fireEvent.click(disclosure);
  expect(await screen.findByText('22631')).toBeVisible();
  expect(getComputerDetails).toHaveBeenCalledTimes(3);
});
