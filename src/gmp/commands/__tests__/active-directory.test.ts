/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import ActiveDirectoryCommand from 'gmp/commands/active-directory';
import {
  AD_SOURCE,
  AD_BASE,
  AD_CONTAINER,
  AD_NESTED_CONTAINER,
  AD_CLIENTS,
  AD_ACCOUNTING,
  AD_FILE_SERVERS,
  AD_CRITICAL_SERVERS,
  AD_OBJECTS,
  directoryObjectsXml,
} from 'gmp/commands/fixtures/active-directory';
import {createDirectoryHttp} from 'gmp/commands/fixtures/active-directory-http';
import Response from 'gmp/http/response';
import {getDirectoryMembers} from 'gmp/models/directory-graph';

const sourceId = AD_SOURCE;
describe('ActiveDirectoryCommand wire contract', () => {
  test('retains task/config relationships during recursive selection', async () => {
    const http = createDirectoryHttp('relationships');
    const result = await new ActiveDirectoryCommand(http).resolveSubtree({
      sourceId,
      branchId: AD_CLIENTS,
      kind: 'ou',
    });
    const multiple = result.data.computers.find(
      node => node.name === 'pc-multiple-targets.domain.local',
    );
    expect(multiple?.operatingSystemVersion).toBe('10.0 (22631)');
    expect(
      result.data.computers.find(node => node.name === 'pc-043.domain.local')
        ?.description,
    ).toBe('Accounting workstation & finance reporting');
    expect(multiple?.description).toBeUndefined();
    expect(multiple?.matchedTargets).toHaveLength(2);
    expect(multiple?.matchedTargets?.[0].tasks).toHaveLength(2);
    expect(multiple?.matchedTargets?.[0].tasks?.[1].config?.name).toBe(
      'Discovery',
    );
    expect(multiple?.matchedTargets?.[1].tasks).toEqual([]);
    const unavailable = result.data.computers.find(
      node => node.name === 'pc-tasks-unavailable.domain.local',
    );
    expect(unavailable?.matchedTargets?.[0].tasks).toBeUndefined();
    for (const [, options] of http.request.mock.calls) {
      expect(options.args).toEqual(
        expect.objectContaining({targets: 1, tasks: 1, details: 1}),
      );
    }
  });
  test('opts into containers and resolves nested container members', async () => {
    const http = createDirectoryHttp();
    const command = new ActiveDirectoryCommand(http);
    const defaults = await command.getOverview({sourceId});
    expect(defaults.data.roots.some(node => node.kind === 'container')).toBe(
      false,
    );
    expect(http.request.mock.calls[0][1].args).not.toHaveProperty(
      'object_types:',
    );
    const showContainers = true;
    const enabled = await command.getOverview({sourceId, showContainers});
    expect(enabled.data.roots).toContainEqual(
      expect.objectContaining({
        id: AD_CONTAINER,
        kind: 'container',
      }),
    );
    const branch = {
      sourceId,
      branchId: AD_CONTAINER,
      kind: 'container',
      showContainers,
    } as const;
    const children = await command.getChildren(branch);
    expect(children.data.roots.map(node => node.id)).toEqual([
      AD_NESTED_CONTAINER,
    ]);
    const resolution = await command.resolveSubtree(branch);
    expect(resolution.data.computers.map(node => node.hostname)).toEqual([
      'container-pc.domain.local',
    ]);
    for (const [, {args}] of http.request.mock.calls.slice(1)) {
      expect(args).toMatchObject({
        'object_types:': ['ou', 'computer', 'group', 'container'],
        targets: 1,
        tasks: 1,
      });
    }
  });
  test('browses exactly one level per call without resolving descendants', async () => {
    const http = createDirectoryHttp();
    const command = new ActiveDirectoryCommand(http);
    const root = await command.getOverview({sourceId});
    expect(root.data.roots.some(node => node.id === AD_CLIENTS)).toBe(true);
    expect(root.data.roots.some(node => node.id === AD_ACCOUNTING)).toBe(false);
    expect(http.request).toHaveBeenCalledTimes(1);
    const branch = await command.getChildren({
      sourceId,
      branchId: AD_CLIENTS,
      kind: 'ou',
    });
    expect(branch.data.roots.map(node => node.id)).toEqual([
      AD_ACCOUNTING,
      AD_FILE_SERVERS,
      AD_CRITICAL_SERVERS,
    ]);
    expect(http.request).toHaveBeenCalledTimes(2);
    expect(http.request).toHaveBeenLastCalledWith('get', {
      args: expect.objectContaining({scope: 'onelevel', base_dn: AD_CLIENTS}),
    });
  });

  test('preserves descriptions for every object type without requesting details', async () => {
    const http = createDirectoryHttp();
    const fixture = AD_OBJECTS.map(node => ({
      ...node,
      description:
        node.kind === 'ou'
          ? 'Department & team'
          : node.kind === 'group'
            ? 'Server group'
            : '',
    }));
    http.request.mockResolvedValueOnce(
      new Response(directoryObjectsXml(fixture, new URLSearchParams())),
    );
    const result = await new ActiveDirectoryCommand(http).getObjects({
      sourceId,
      scope: 'subtree',
      details: false,
    });
    expect(http.request).toHaveBeenCalledWith('get', {
      args: expect.objectContaining({details: 0}),
    });
    expect(
      result.data.roots
        .filter(node => node.kind === 'ou')
        .every(node => node.description === 'Department & team'),
    ).toBe(true);
    expect(
      result.data.roots
        .filter(node => node.kind === 'group')
        .every(node => node.description === 'Server group'),
    ).toBe(true);
    expect(
      result.data.roots
        .filter(node => node.kind === 'computer')
        .every(node => node.description === undefined),
    ).toBe(true);
    const plain = await new ActiveDirectoryCommand(http).getObjects({
      sourceId,
      baseDn: AD_ACCOUNTING,
      details: false,
    });
    expect(
      plain.data.roots.find(node => node.name === 'pc-043.domain.local')
        ?.description,
    ).toBe('Accounting workstation & finance reporting');
  });

  test('serializes options and parses optional attributes and structured matches', async () => {
    const http = createDirectoryHttp();
    const result = await new ActiveDirectoryCommand(http).getObjects({
      sourceId,
      baseDn: AD_ACCOUNTING,
      scope: 'subtree',
      objectTypes: ['computer'],
      includeDisabledComputers: false,
      targets: false,
      tasks: true,
      details: true,
      maxResults: 200,
    });
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_active_directory_objects',
        credential_id: sourceId,
        scope: 'subtree',
        base_dn: AD_ACCOUNTING,
        'object_types:': ['computer'],
        include_disabled_computers: 0,
        targets: 1,
        tasks: 1,
        details: 1,
        max_results: 200,
      },
    });
    expect(result.data.counts.disabled).toBeUndefined();
    const captured = result.data.roots.find(
      node => node.name === 'pc-043.domain.local',
    );
    expect(captured).toMatchObject({
      kind: 'computer',
      disabled: false,
      operatingSystemVersion: '10.0 (22631)',
      servicePrincipalNames: ['HOST/example.domain.local'],
      matchedTargets: [
        {
          name: 'Office network',
          tasks: [
            {name: 'Weekly workstation scan', config: {name: 'Full and fast'}},
          ],
        },
      ],
    });
    expect(
      result.data.roots.find(node => node.name === 'no-hostname.domain.local'),
    ).toHaveProperty('hostname', undefined);
    const plain = await new ActiveDirectoryCommand(http).getObjects({
      sourceId,
      baseDn: AD_ACCOUNTING,
      targets: false,
    });
    expect(plain.data.counts.captured).toBeUndefined();
    expect(plain.data.roots[0]).toHaveProperty('matchedTargets', undefined);
    expect(plain.data.roots[0]).toHaveProperty(
      'servicePrincipalNames',
      undefined,
    );
  });

  test('preserves fetched counts and truncation and refuses incomplete recursive selection', async () => {
    const http = createDirectoryHttp();
    const command = new ActiveDirectoryCommand(http);
    const result = await command.getObjects({
      sourceId,
      scope: 'subtree',
      maxResults: 1,
    });
    expect(result.data.truncated).toBe(true);
    expect(result.data.roots).toHaveLength(1);
    http.request.mockResolvedValueOnce(
      new Response(
        directoryObjectsXml(
          AD_OBJECTS.slice(0, 1),
          new URLSearchParams(),
          true,
        ),
      ),
    );
    await expect(
      command.resolveSubtree({sourceId, branchId: AD_CLIENTS, kind: 'ou'}),
    ).rejects.toThrow('incomplete');
  });

  test('resolves nested groups sequentially with the credential search base', async () => {
    const http = createDirectoryHttp();
    const result = await new ActiveDirectoryCommand(http).resolveSubtree({
      sourceId,
      branchId: AD_CLIENTS,
      kind: 'ou',
    });
    expect(result.data.computers).toHaveLength(7);
    expect(
      getDirectoryMembers(result.data.graph, AD_ACCOUNTING).computers,
    ).toHaveLength(5);
    expect(
      getDirectoryMembers(result.data.graph, AD_FILE_SERVERS).computers,
    ).toHaveLength(2);
    expect(
      getDirectoryMembers(result.data.graph, AD_CRITICAL_SERVERS).computers,
    ).toHaveLength(2);
    expect(http.request).toHaveBeenCalledTimes(3);
    expect(http.request).toHaveBeenNthCalledWith(2, 'get', {
      args: expect.objectContaining({
        scope: 'subtree',
        group_dn: AD_FILE_SERVERS,
      }),
    });
    expect(http.request.mock.calls[1][1].args).not.toHaveProperty('base_dn');
  });

  test('terminates cycles and computes membership for overlapping cyclic groups', async () => {
    const http = createDirectoryHttp();
    http.request.mockImplementation(async (_method, {args}) => {
      const group = args.group_dn;
      const next =
        group === AD_FILE_SERVERS ? AD_CRITICAL_SERVERS : AD_FILE_SERVERS;
      const computer = AD_OBJECTS.find(
        node =>
          node.name ===
          (group === AD_FILE_SERVERS
            ? 'fs-01.domain.local'
            : 'fs-02.domain.local'),
      );
      const nextGroup = AD_OBJECTS.find(node => node.id === next);
      if (!computer || !nextGroup) throw new Error('Missing group fixture');
      return new Response(
        directoryObjectsXml(
          [nextGroup, computer],
          new URLSearchParams('targets=1'),
        ),
      );
    });
    const result = await new ActiveDirectoryCommand(http).resolveSubtree({
      sourceId,
      branchId: AD_FILE_SERVERS,
      kind: 'group',
    });
    expect(http.request).toHaveBeenCalledTimes(2);
    expect(result.data.computers).toHaveLength(2);
    expect(
      getDirectoryMembers(result.data.graph, AD_CRITICAL_SERVERS).computers,
    ).toHaveLength(2);
  });

  test('rejects excessive nesting before committing a selection', async () => {
    const http = createDirectoryHttp();
    http.request.mockImplementation(async (_method, {args}) => {
      const depth = Number(String(args.group_dn).split(',')[0].slice(3));
      return new Response(
        directoryObjectsXml(
          [
            {
              kind: 'group',
              id: `CN=${depth + 1},${AD_BASE}`,
              name: 'Nested',
              parent: AD_BASE,
            },
          ],
          new URLSearchParams(),
        ),
      );
    });
    await expect(
      new ActiveDirectoryCommand(http).resolveSubtree({
        sourceId,
        branchId: `CN=0,${AD_BASE}`,
        kind: 'group',
      }),
    ).rejects.toThrow('Maximum nesting depth reached');
    expect(http.request).toHaveBeenCalledTimes(32);
  });

  test('accepts an empty result but rejects errors and malformed responses', async () => {
    const http = createDirectoryHttp();
    http.request.mockResolvedValueOnce(
      new Response(directoryObjectsXml([], new URLSearchParams())),
    );
    const command = new ActiveDirectoryCommand(http);
    expect((await command.getOverview({sourceId})).data).toMatchObject({
      roots: [],
      truncated: false,
      counts: {found: 0},
    });
    http.request.mockResolvedValueOnce(
      new Response(
        '<envelope><get_active_directory_objects><get_active_directory_objects_response status="503" status_text="AD unavailable"/></get_active_directory_objects></envelope>',
      ),
    );
    await expect(command.getOverview({sourceId})).rejects.toThrow(
      'AD unavailable',
    );
    http.request.mockResolvedValueOnce(new Response('<envelope/>'));
    await expect(command.getOverview({sourceId})).rejects.toThrow();
  });
});
