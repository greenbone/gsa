/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type DirectoryComputer,
  type DirectoryNode,
} from 'gmp/models/active-directory';
import {isDefined} from 'gmp/utils/identity';

export interface DirectorySnapshot {
  owner: string;
  children: string[];
  complete: boolean;
}

/** One credential/session owns this graph. Each branch has one current snapshot. */
export interface DirectoryGraph {
  nodes: Record<string, DirectoryNode>;
  branches: Record<string, DirectorySnapshot>;
}

export const emptyDirectoryGraph = (): DirectoryGraph => ({
  nodes: {},
  branches: {},
});

export const beginDirectorySnapshot = (
  graph: DirectoryGraph,
  id: string,
  owner: string,
): DirectoryGraph => ({
  ...graph,
  branches: {...graph.branches, [id]: {owner, children: [], complete: false}},
});

export const replaceDirectorySnapshot = (
  graph: DirectoryGraph,
  id: string,
  owner: string,
  children: DirectoryNode[],
  complete: boolean,
): DirectoryGraph => ({
  nodes: {
    ...graph.nodes,
    ...Object.fromEntries(children.map(node => [node.id, node])),
  },
  branches: {
    ...graph.branches,
    [id]: {owner, children: children.map(node => node.id), complete},
  },
});

/** Cycles contribute no new members. Missing or partial snapshots propagate incompleteness. */
export const getDirectoryMembers = (
  graph: DirectoryGraph,
  id: string,
): {computers: DirectoryComputer[]; complete: boolean; branchIds: string[]} => {
  const snapshot = graph.branches[id];
  if (!snapshot) return {computers: [], complete: false, branchIds: []};

  const visited = new Set([id]);
  const pending = [...snapshot.children].reverse();
  let complete = snapshot.complete;
  const computers: DirectoryComputer[] = [];
  const branchIds = [id];

  while (pending.length > 0) {
    const childId = pending.pop();
    if (!isDefined(childId) || visited.has(childId)) continue;
    visited.add(childId);

    const node = graph.nodes[childId];
    if (!node) {
      complete = false;
      continue;
    }
    if (node.kind === 'computer') {
      computers.push(node);
      continue;
    }

    const branch = graph.branches[childId];
    if (!branch) {
      complete = false;
      continue;
    }
    branchIds.push(childId);
    complete = complete && branch.complete;
    // The stack visits children in their original order.
    for (let index = branch.children.length - 1; index >= 0; index--) {
      pending.push(branch.children[index]);
    }
  }

  return {computers, complete, branchIds};
};

/** Resolution snapshots replace branch edges; unrelated branch snapshots survive. */
export const mergeDirectoryGraph = (
  graph: DirectoryGraph,
  incoming: DirectoryGraph,
): DirectoryGraph => ({
  nodes: {...graph.nodes, ...incoming.nodes},
  branches: {...graph.branches, ...incoming.branches},
});

/** Give each visible computer one display location, preferring expanded groups. */
export const getDirectoryComputerPaths = (
  roots: DirectoryNode[],
  expandedListings: ReadonlyMap<string, DirectoryNode[]>,
  showDisabled: boolean,
): Record<string, string> => {
  const paths: Record<string, string> = {};
  const visit = (
    children: DirectoryNode[],
    path: string[],
    pathKey: string,
  ) => {
    for (const kind of ['group', 'ou', 'container'] as const) {
      for (const child of children) {
        if (child.kind !== kind || path.includes(child.id)) continue;
        const childPath = [...path, child.id];
        const childKey = JSON.stringify(childPath);
        const listing = expandedListings.get(childKey);
        if (listing) visit(listing, childPath, childKey);
      }
    }
    for (const child of children) {
      if (
        child.kind === 'computer' &&
        (showDisabled || !child.disabled) &&
        !isDefined(paths[child.id])
      ) {
        paths[child.id] = pathKey;
      }
    }
  };
  visit(roots, [], '[]');
  return paths;
};
