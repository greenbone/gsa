/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type DirectoryComputer} from 'gmp/models/active-directory';

export const getSelectedMembersOfIncompleteBranches = (
  selectedPaths: ReadonlyMap<string, readonly string[]>,
  knownMembers: Record<string, DirectoryComputer[]>,
  completeMemberships: Record<string, DirectoryComputer[]>,
) => {
  const selectedMembers = new Map<string, Set<string>>();
  const addMember = (branchId: string, computerId: string) => {
    const members = selectedMembers.get(branchId) ?? new Set<string>();
    members.add(computerId);
    selectedMembers.set(branchId, members);
  };

  for (const [branchId, members] of Object.entries(knownMembers)) {
    if (completeMemberships[branchId] !== undefined) continue;
    for (const {id} of members) {
      if (selectedPaths.has(id)) addMember(branchId, id);
    }
  }
  for (const [id, path] of selectedPaths) {
    for (const branchId of path) {
      if (completeMemberships[branchId] === undefined) addMember(branchId, id);
    }
  }
  return selectedMembers;
};

export const getBranchSelectionSummary = (
  members: DirectoryComputer[] | undefined,
  selectedIds: ReadonlySet<string>,
  showDisabled: boolean,
) => {
  let eligibleCount = 0;
  let selectedCount = 0;
  for (const computer of members ?? []) {
    if (!computer.hostname || (!showDisabled && computer.disabled)) continue;
    eligibleCount++;
    if (selectedIds.has(computer.id)) selectedCount++;
  }
  return {
    total: members === undefined ? undefined : eligibleCount,
    selectedCount,
    checked: eligibleCount > 0 && selectedCount === eligibleCount,
    indeterminate: selectedCount > 0 && selectedCount < eligibleCount,
  };
};

export const mergeSelection = (
  selected: DirectoryComputer[],
  added: DirectoryComputer[],
  showDisabled: boolean,
) =>
  Array.from(
    new Map(
      [...selected, ...added]
        .filter(
          computer => computer.hostname && (showDisabled || !computer.disabled),
        )
        .map(computer => [computer.id, computer]),
    ).values(),
  );

export const selectedHostnames = (selected: DirectoryComputer[]) =>
  Array.from(
    new Set(
      selected.flatMap(computer =>
        computer.hostname ? [computer.hostname.toLowerCase()] : [],
      ),
    ),
  );
