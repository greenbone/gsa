/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type DirectoryComputer,
  type DirectoryNode,
} from 'gmp/models/active-directory';

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
  path = new Set<string>(),
): {computers: DirectoryComputer[]; complete: boolean} => {
  if (path.has(id)) return {computers: [], complete: true};
  const snapshot = graph.branches[id];
  if (!snapshot) return {computers: [], complete: false};
  const nextPath = new Set([...path, id]);
  let complete = snapshot.complete;
  const computers: DirectoryComputer[] = [];
  for (const childId of snapshot.children) {
    const node = graph.nodes[childId];
    if (!node) {
      complete = false;
      continue;
    }
    if (node.kind === 'computer') computers.push(node);
    else {
      const members = getDirectoryMembers(graph, childId, nextPath);
      computers.push(...members.computers);
      complete = complete && members.complete;
    }
  }
  return {
    computers: [...new Map(computers.map(node => [node.id, node])).values()],
    complete,
  };
};

/** Resolution snapshots replace branch edges; unrelated branch snapshots survive. */
export const mergeDirectoryGraph = (
  graph: DirectoryGraph,
  incoming: DirectoryGraph,
): DirectoryGraph => ({
  nodes: {...graph.nodes, ...incoming.nodes},
  branches: {...graph.branches, ...incoming.branches},
});

/** Give each computer one display location, visiting groups before loose hosts.
 * Membership edges remain intact for recursive selection and counts.
 */
export const getDirectoryComputerPaths = (
  graph: DirectoryGraph,
): Record<string, string> => {
  const paths: Record<string, string> = {};
  const visited = new Set<string>();
  const visit = (id: string, path: string[]) => {
    if (visited.has(id)) return;
    visited.add(id);
    const children = (graph.branches[id]?.children ?? []).flatMap(childId =>
      graph.nodes[childId] ? [graph.nodes[childId]] : [],
    );
    for (const kind of ['group', 'ou', 'container'] as const) {
      for (const child of children) {
        if (child.kind === kind) visit(child.id, [...path, child.id]);
      }
    }
    for (const child of children) {
      if (child.kind === 'computer' && paths[child.id] === undefined) {
        paths[child.id] = JSON.stringify(path);
      }
    }
  };
  visit('directory-root', []);
  return paths;
};
