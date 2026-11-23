/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type DirectoryBranch,
  type DirectoryNode,
  type DirectoryOverview,
  type DirectoryResolution,
} from 'gmp/models/active-directory';
import {
  type DirectoryGraph,
  type DirectorySnapshot,
  emptyDirectoryGraph,
  getDirectoryMembers,
  mergeDirectoryGraph,
  replaceDirectorySnapshot,
} from 'gmp/models/directory-graph';

type FetchListing = (
  id: string,
  kind: DirectoryBranch['kind'],
) => Promise<DirectoryOverview>;

export class IncompleteDirectoryResultsError extends Error {
  constructor() {
    super('Directory results are incomplete.');
    this.name = 'IncompleteDirectoryResultsError';
  }
}

const replaceSubtreeSnapshots = (
  graph: DirectoryGraph,
  rootId: string,
  objects: DirectoryNode[],
): DirectoryGraph => {
  const branchIds = [rootId];
  const childrenByParent = new Map<string, DirectoryNode[]>();
  for (const node of objects) {
    if (node.kind === 'ou' || node.kind === 'container')
      branchIds.push(node.id);
    const siblings = childrenByParent.get(node.parentDn);
    if (siblings) siblings.push(node);
    else childrenByParent.set(node.parentDn, [node]);
  }

  const nodes = new Map<string, DirectoryNode>();
  const branches = new Map<string, DirectorySnapshot>();
  for (const id of branchIds) {
    const children = childrenByParent.get(id) ?? [];
    // Preserve the original parent order when a node occurs in multiple snapshots.
    for (const child of children) nodes.set(child.id, child);
    branches.set(id, {
      owner: 'resolution',
      children: children.map(node => node.id),
      complete: true,
    });
  }
  return mergeDirectoryGraph(graph, {
    nodes: Object.fromEntries(nodes),
    branches: Object.fromEntries(branches),
  });
};

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
    if (truncated) throw new IncompleteDirectoryResultsError();

    if (branchKind === 'group') {
      graph = replaceDirectorySnapshot(graph, id, 'resolution', roots, true);
      for (const node of roots)
        if (node.kind !== 'computer')
          await visitBranch(node.id, node.kind, nextPath);
      return;
    }

    graph = replaceSubtreeSnapshots(graph, id, roots);
    for (const node of roots)
      if (node.kind === 'group')
        await visitBranch(node.id, node.kind, nextPath);
  };

  await visitBranch(branchId, kind, new Set());
  const {computers, complete} = getDirectoryMembers(graph, branchId);
  if (!complete) throw new IncompleteDirectoryResultsError();
  return {computers, graph};
};
