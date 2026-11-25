/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import {AD_SOURCE, AD_CLIENTS} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import {
  getBranchSelectionSummary,
  mergeSelection,
  selectedHostnames,
} from 'web/pages/active-directory/directory-selection';

describe('Directory selection', () => {
  test('deduplicates membership, excludes missing hostnames, and tracks partial selection', async () => {
    const command = new ActiveDirectoryCommand(createDirectoryHttp());
    const {
      data: {computers},
    } = await command.resolveSubtree({
      sourceId: AD_SOURCE,
      branchId: AD_CLIENTS,
      kind: 'ou',
    });
    const selected = mergeSelection([], computers, false);
    const selectedIds = new Set(selected.map(computer => computer.id));
    expect(selected).toHaveLength(5);
    expect(
      getBranchSelectionSummary(computers, selectedIds, false),
    ).toMatchObject({
      checked: true,
      indeterminate: false,
      selectableCount: 5,
      total: computers.length,
    });
    expect(
      getBranchSelectionSummary(
        computers,
        new Set(selected.slice(1).map(computer => computer.id)),
        false,
      ),
    ).toMatchObject({checked: false, indeterminate: true});
    expect(mergeSelection(selected, computers, false)).toHaveLength(5);
    expect(selectedHostnames([...selected, ...selected])).toHaveLength(5);
    expect(mergeSelection(selected, computers, true)).toHaveLength(6);
    expect(
      getBranchSelectionSummary(undefined, selectedIds, false),
    ).toMatchObject({checked: false, total: undefined});
  });
});
