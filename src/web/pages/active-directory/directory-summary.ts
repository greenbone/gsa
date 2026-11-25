/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
} from 'gmp/models/active-directory';
import {
  type DirectoryGraph,
  getDirectoryMembers,
} from 'gmp/models/directory-graph';

export const summarizeDirectory = (graph: DirectoryGraph) => {
  const completeMemberships: Record<string, DirectoryComputer[]> = {};
  const knownMembers: Record<string, DirectoryComputer[]> = {};
  for (const id of Object.keys(graph.branches)) {
    const members = getDirectoryMembers(graph, id);
    knownMembers[id] = members.computers;
    if (members.complete) completeMemberships[id] = members.computers;
  }

  const redundantBranchSummaries = Object.entries(graph.branches).flatMap(
    ([id, snapshot]) => {
      const branchChildren = snapshot.children
        .map(childId => graph.nodes[childId])
        .filter(
          (node): node is Exclude<DirectoryNode, DirectoryComputer> =>
            node !== undefined && node.kind !== 'computer',
        );
      if (branchChildren.length !== 1) return [];
      const parentMembers = knownMembers[id] ?? [];
      const childMembers = knownMembers[branchChildren[0].id] ?? [];
      if (parentMembers.length !== childMembers.length) return [];
      const childIds = new Set(childMembers.map(child => child.id));
      return parentMembers.every(parent => childIds.has(parent.id)) ? [id] : [];
    },
  );

  const computers = knownMembers['directory-root'] ?? [];
  let disabled = 0;
  let captured = 0;
  let available = 0;
  let availableIncludingDisabled = 0;
  let matchingKnown = true;
  for (const computer of computers) {
    if (computer.disabled) disabled++;
    if (computer.matchedTargets === undefined) {
      matchingKnown = false;
    } else if (computer.matchedTargets.length > 0) {
      captured++;
    } else {
      availableIncludingDisabled++;
      if (!computer.disabled) available++;
    }
  }

  const counts: DirectoryOverview['counts'] = {
    found: computers.length,
    disabled,
    captured: matchingKnown ? captured : undefined,
    available: matchingKnown ? available : undefined,
  };
  return {
    availableIncludingDisabled: matchingKnown
      ? availableIncludingDisabled
      : undefined,
    completeMemberships,
    counts,
    isPartial: Object.values(graph.branches).some(branch => !branch.complete),
    knownMembers,
    redundantBranchSummaries,
  };
};
