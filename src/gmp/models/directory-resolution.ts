/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type DirectoryBranch,
  type DirectoryOverview,
  type DirectoryResolution,
} from 'gmp/models/active-directory';
import {
  emptyDirectoryGraph,
  getDirectoryMembers,
  replaceDirectorySnapshot,
} from 'gmp/models/directory-graph';

type FetchListing = (
  id: string,
  kind: DirectoryBranch['kind'],
) => Promise<DirectoryOverview>;

const incompleteResults =
  'Directory results are incomplete. Your selection has been preserved.';

export const resolveDirectorySubtree = async (
  branchId: string,
  kind: DirectoryBranch['kind'],
  fetchListing: FetchListing,
): Promise<DirectoryResolution> => {
  let graph = emptyDirectoryGraph();
  const visitBranch = async (
    id: string,
    branchKind: DirectoryBranch['kind'],
    path: Set<string>,
  ) => {
    if (path.has(id) || graph.branches[id]) return;
    if (path.size >= 32)
      throw new Error(
        'Maximum nesting depth reached – some members may not have been captured. Your selection has been preserved.',
      );
    const nextPath = new Set([...path, id]);
    const {roots, truncated} = await fetchListing(id, branchKind);
    if (truncated) throw new Error(incompleteResults);

    if (branchKind === 'group') {
      graph = replaceDirectorySnapshot(graph, id, 'resolution', roots, true);
      for (const node of roots)
        if (node.kind !== 'computer')
          await visitBranch(node.id, node.kind, nextPath);
      return;
    }

    const branchIds = [
      id,
      ...roots
        .filter(node => node.kind === 'ou' || node.kind === 'container')
        .map(node => node.id),
    ];
    for (const parentId of branchIds)
      graph = replaceDirectorySnapshot(
        graph,
        parentId,
        'resolution',
        roots.filter(node => node.parentDn === parentId),
        true,
      );
    for (const node of roots)
      if (node.kind === 'group')
        await visitBranch(node.id, node.kind, nextPath);
  };

  await visitBranch(branchId, kind, new Set());
  const {computers, complete} = getDirectoryMembers(graph, branchId);
  if (!complete) throw new Error(incompleteResults);
  return {computers, graph};
};
