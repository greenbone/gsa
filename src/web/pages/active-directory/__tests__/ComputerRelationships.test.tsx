/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, userEvent, within} from 'web/testing';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import {AD_SOURCE, AD_ACCOUNTING} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import ComputerRelationships from 'web/pages/active-directory/ComputerRelationships';
import ComputerRow from 'web/pages/active-directory/ComputerRow';
import DirectoryTree from 'web/pages/active-directory/DirectoryTree';

describe('Computer relationship table', () => {
  test('shows a concise summary without a table for zero matches', async () => {
    const result = await new ActiveDirectoryCommand(
      createDirectoryHttp('relationships'),
    ).getChildren({
      sourceId: AD_SOURCE,
      branchId: AD_ACCOUNTING,
      kind: 'ou',
      maxResults: 100,
    });
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <DirectoryTree
        knownMembers={{}}
        memberships={{}}
        nodes={result.data.roots}
        selected={[]}
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
    expect(within(row).getByText('OS version')).toBeVisible();
    expect(within(row).getByText('10.0 (22631)')).toBeVisible();
    expect(
      within(row).getByText(
        'CN=pc-no-target,OU=Accounting,OU=Clients,DC=domain,DC=local',
      ),
    ).toBeVisible();
  });

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
  test('shows target, task, and config columns without changing selection or fetching', async () => {
    const http = createDirectoryHttp('relationships');
    const result = await new ActiveDirectoryCommand(http).getChildren({
      sourceId: AD_SOURCE,
      branchId: AD_ACCOUNTING,
      kind: 'ou',
      maxResults: 100,
    });
    const onSelect = testing.fn();
    const {render} = rendererWith({capabilities: true, router: true});
    render(
      <DirectoryTree
        knownMembers={{}}
        memberships={{}}
        nodes={result.data.roots}
        selected={[]}
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
    expect(http.request).toHaveBeenCalledTimes(1);
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
    expect(http.request).toHaveBeenCalledTimes(1);
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
  const {render} = rendererWith({capabilities: true, router: true});
  render(
    <ul>
      <ComputerRow
        checked={false}
        node={{
          id: 'CN=missing,DC=domain,DC=local',
          kind: 'computer',
          name: 'missing',
          parentDn: 'DC=domain,DC=local',
          disabled: false,
        }}
        selectionPending={false}
        onSelect={onSelect}
      />
    </ul>,
  );
  expect(screen.getByRole('checkbox', {name: 'missing'})).toBeDisabled();
  await userEvent.click(
    screen.getByRole('button', {name: 'Computer details for missing'}),
  );
  const panel = screen.getByRole('region', {
    name: 'Computer details for missing',
  });
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
