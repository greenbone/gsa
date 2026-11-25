/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {
  AD_ACCOUNTING,
  AD_CLIENTS,
  AD_OBJECTS,
} from 'gmp/commands/fixtures/active-directory';
import {type DirectoryNode} from 'gmp/models/active-directory';
import {
  beginDirectorySnapshot,
  emptyDirectoryGraph,
  getDirectoryMembers,
  getDirectoryComputerPaths,
  replaceDirectorySnapshot,
} from 'gmp/models/directory-graph';

const nodes: DirectoryNode[] = AD_OBJECTS.map(node =>
  node.kind === 'computer'
    ? {
        ...node,
        kind: 'computer',
        parentDn: node.parent,
        disabled: !!node.disabled,
      }
    : {...node, kind: node.kind, parentDn: node.parent},
);

describe('directory graph snapshots', () => {
  test('a new opening invalidates previous membership and replaces removed edges', () => {
    let graph = replaceDirectorySnapshot(
      emptyDirectoryGraph(),
      AD_CLIENTS,
      'first',
      nodes.filter(node => node.parentDn === AD_CLIENTS),
      true,
    );
    const computers = nodes.filter(
      node => node.kind === 'computer' && node.parentDn === AD_ACCOUNTING,
    );
    graph = replaceDirectorySnapshot(
      graph,
      AD_ACCOUNTING,
      'selection',
      computers,
      true,
    );
    expect(getDirectoryMembers(graph, AD_ACCOUNTING).computers).toHaveLength(5);
    graph = beginDirectorySnapshot(graph, AD_ACCOUNTING, 'second');
    expect(getDirectoryMembers(graph, AD_ACCOUNTING)).toEqual({
      computers: [],
      complete: false,
      branchIds: [AD_ACCOUNTING],
    });
    graph = replaceDirectorySnapshot(
      graph,
      AD_ACCOUNTING,
      'second',
      computers.slice(0, 1),
      true,
    );
    expect(getDirectoryMembers(graph, AD_ACCOUNTING).computers).toHaveLength(1);
    expect(graph.branches[AD_ACCOUNTING].owner).toBe('second');
  });

  test('keeps depth-first member order across shared and incomplete branches', () => {
    const computers = nodes.filter(node => node.kind === 'computer');
    const [first, second, third] = computers;
    const [left, right, shared] = ['left', 'right', 'shared'].map(
      (id): DirectoryNode => ({id, kind: 'group', name: id, parentDn: 'root'}),
    );
    let graph = replaceDirectorySnapshot(
      emptyDirectoryGraph(),
      'directory-root',
      'root',
      [left, right],
      true,
    );
    graph = replaceDirectorySnapshot(
      graph,
      left.id,
      'left',
      [shared, second],
      true,
    );
    graph = replaceDirectorySnapshot(
      graph,
      right.id,
      'right',
      [third, shared],
      true,
    );
    graph = replaceDirectorySnapshot(
      graph,
      shared.id,
      'shared',
      [first],
      false,
    );

    expect(getDirectoryMembers(graph, 'directory-root')).toEqual({
      computers: [first, second, third],
      complete: false,
      branchIds: ['directory-root', left.id, shared.id, right.id],
    });
  });
});

test('shows a shared computer once inside its nested group, including cyclic membership', () => {
  const host: DirectoryNode = {
    id: 'host',
    kind: 'computer',
    name: 'server',
    parentDn: 'root',
    disabled: false,
  };
  const group: DirectoryNode = {
    id: 'group',
    kind: 'group',
    name: 'File servers',
    parentDn: 'root',
  };
  const nested: DirectoryNode = {
    id: 'nested',
    kind: 'group',
    name: 'Critical servers',
    parentDn: 'root',
  };
  let graph = replaceDirectorySnapshot(
    emptyDirectoryGraph(),
    'directory-root',
    'root',
    [host, group, nested],
    true,
  );
  graph = replaceDirectorySnapshot(graph, group.id, 'group', [nested], true);
  graph = replaceDirectorySnapshot(
    graph,
    nested.id,
    'nested',
    [host, group],
    true,
  );
  const roots = [host, group, nested];
  const expanded = new Map([
    [JSON.stringify(['group']), [nested]],
    [JSON.stringify(['group', 'nested']), [host, group]],
    [JSON.stringify(['nested']), [host, group]],
  ]);
  expect(getDirectoryComputerPaths(roots, expanded, false)).toEqual({
    host: JSON.stringify(['group', 'nested']),
  });
  expanded.delete(JSON.stringify(['group']));
  expanded.delete(JSON.stringify(['group', 'nested']));
  expect(getDirectoryComputerPaths(roots, expanded, false)).toEqual({
    host: JSON.stringify(['nested']),
  });
  expect(
    getDirectoryMembers(graph, 'directory-root').computers.map(node => node.id),
  ).toEqual(['host']);
});
