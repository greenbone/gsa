/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type DirectoryComputer} from 'gmp/models/active-directory';
import {
  type DirectoryGraph,
  getDirectoryMembers,
} from 'gmp/models/directory-graph';
import {isDefined} from 'gmp/utils/identity';

export const getBranchesByComputer = (
  graph: DirectoryGraph,
  rootId: string,
) => {
  const branchesByComputer = new Map<string, string[]>();
  const root = getDirectoryMembers(graph, rootId);
  for (const branchId of root.branchIds) {
    const {computers} =
      branchId === rootId ? root : getDirectoryMembers(graph, branchId);
    for (const {id} of computers) {
      const branches = branchesByComputer.get(id);
      if (branches) branches.push(branchId);
      else branchesByComputer.set(id, [branchId]);
    }
  }
  return branchesByComputer;
};

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
    if (isDefined(completeMemberships[branchId])) continue;
    for (const {id} of members) {
      if (selectedPaths.has(id)) addMember(branchId, id);
    }
  }
  for (const [id, path] of selectedPaths) {
    for (const branchId of path) {
      if (!isDefined(completeMemberships[branchId])) addMember(branchId, id);
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
    total: members?.length,
    selectableCount: eligibleCount,
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
