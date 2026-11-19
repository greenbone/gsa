/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand from 'gmp/commands/http';
import Response from 'gmp/http/response';
import {
  type DirectoryBranch,
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
  type DirectoryResolution,
  type DirectoryTarget,
} from 'gmp/models/active-directory';
import {
  emptyDirectoryGraph,
  replaceDirectorySnapshot,
  getDirectoryMembers,
} from 'gmp/models/directory-graph';

export interface DirectorySourceParams {
  sourceId: string;
  showContainers?: boolean;
}

export interface DirectoryBranchParams extends DirectorySourceParams {
  branchId: string;
  kind: DirectoryBranch['kind'];
  maxResults?: number;
}

export interface DirectoryObjectsParams extends DirectorySourceParams {
  baseDn?: string;
  groupDn?: string;
  scope?: 'base' | 'onelevel' | 'subtree';
  objectTypes?: DirectoryNode['kind'][];
  includeDisabledComputers?: boolean;
  targets?: boolean;
  tasks?: boolean;
  details?: boolean;
  maxResults?: number;
}

interface ReferenceElement {
  _id: string;
  name: string;
}
interface TargetElement extends ReferenceElement {
  tasks?: {
    task?:
      | (ReferenceElement & {config?: ReferenceElement})[]
      | (ReferenceElement & {config?: ReferenceElement});
  };
}
interface ObjectElement {
  _type: DirectoryNode['kind'];
  distinguished_name: string;
  parent_dn?: string;
  name: string;
  dns_hostname?: string;
  disabled?: string | number;
  operating_system?: string;
  operating_system_version?: string;
  description?: string;
  service_principal_names?: {service_principal_name?: string | string[]};
  targets?: {target?: TargetElement | TargetElement[]};
}
interface ObjectsResponse {
  _status: string;
  _status_text: string;
  objects?: {
    _truncated: string;
    count: {
      ou: number;
      container: number;
      group: number;
      computer: {total: number; disabled?: number};
    };
    object?: ObjectElement | ObjectElement[];
  };
}
const array = <T>(value?: T | T[]): T[] => {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
};
const reference = (value: ReferenceElement) => ({
  id: value._id,
  name: value.name,
});

const parseTarget = (target: TargetElement): DirectoryTarget => {
  const result: DirectoryTarget = reference(target);
  if (target.tasks !== undefined) {
    result.tasks = array(target.tasks.task).map(task => ({
      ...reference(task),
      ...(task.config ? {config: reference(task.config)} : {}),
    }));
  }
  return result;
};

const parseObject = (object: ObjectElement): DirectoryNode => {
  const common = {
    id: object.distinguished_name,
    parentDn: object.parent_dn || '',
    name: object.name,
    description: object.description || undefined,
  };
  if (object._type !== 'computer') return {...common, kind: object._type};
  const matchedTargets: DirectoryTarget[] | undefined =
    object.targets === undefined
      ? undefined
      : array(object.targets.target).map(parseTarget);
  return {
    ...common,
    kind: 'computer',
    hostname: object.dns_hostname || undefined,
    disabled: String(object.disabled) === '1',
    operatingSystem: object.operating_system || undefined,
    operatingSystemVersion: object.operating_system_version || undefined,
    servicePrincipalNames:
      object.service_principal_names === undefined
        ? undefined
        : array(object.service_principal_names.service_principal_name),
    matchedTargets,
  };
};

class ActiveDirectoryCommand extends HttpCommand {
  async getObjects({
    sourceId,
    baseDn,
    groupDn,
    scope = 'onelevel',
    showContainers = false,
    objectTypes = showContainers
      ? ['ou', 'computer', 'group', 'container']
      : undefined,
    includeDisabledComputers = true,
    targets = true,
    tasks = false,
    details = false,
    maxResults,
  }: DirectoryObjectsParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_active_directory_objects',
      credential_id: sourceId,
      scope,
      include_disabled_computers: Number(includeDisabledComputers),
      targets: Number(targets || tasks),
      tasks: Number(tasks),
      ...(details ? {details: 1} : {}),
      ...(baseDn === undefined ? {} : {base_dn: baseDn}),
      ...(groupDn === undefined ? {} : {group_dn: groupDn}),
      ...(objectTypes === undefined ? {} : {'object_types:': objectTypes}),
      ...(maxResults === undefined ? {} : {max_results: maxResults}),
    });
    const wrapper = response.data.get_active_directory_objects as
      | {get_active_directory_objects_response?: ObjectsResponse}
      | undefined;
    const result = wrapper?.get_active_directory_objects_response;
    if (!result || String(result._status) !== '200' || !result.objects) {
      throw new Error(
        result?._status_text || 'Invalid Active Directory response',
      );
    }
    const objects = result.objects;
    const roots = array(objects.object).map(parseObject);
    const computers = roots.filter(
      (node): node is DirectoryComputer => node.kind === 'computer',
    );
    const matched = computers.every(
      computer => computer.matchedTargets !== undefined,
    );
    const overview: DirectoryOverview = {
      roots,
      truncated: String(objects._truncated) === '1',
      counts: {
        found: Number(objects.count.computer.total),
        disabled:
          objects.count.computer.disabled === undefined
            ? undefined
            : Number(objects.count.computer.disabled),
        captured: matched
          ? computers.filter(
              computer => (computer.matchedTargets?.length ?? 0) > 0,
            ).length
          : undefined,
        available: matched
          ? computers.filter(
              computer =>
                !computer.disabled && computer.matchedTargets?.length === 0,
            ).length
          : undefined,
      },
    };
    return response.setData(overview);
  }

  getOverview(params: DirectorySourceParams) {
    return this.getObjects({...params, tasks: true});
  }

  async getComputerDetails({
    sourceId,
    computerDn,
  }: {
    sourceId: string;
    computerDn: string;
  }) {
    const response = await this.getObjects({
      sourceId,
      baseDn: computerDn,
      scope: 'base',
      objectTypes: ['computer'],
      details: true,
      targets: false,
    });
    const {roots, truncated} = response.data;
    const [computer] = roots;
    if (
      truncated ||
      roots.length !== 1 ||
      computer?.kind !== 'computer' ||
      computer.id !== computerDn
    ) {
      throw new Error('Active Directory computer details are unavailable.');
    }
    return response.setData(computer);
  }

  getChildren({
    sourceId,
    branchId,
    kind,
    showContainers,
    maxResults,
  }: DirectoryBranchParams) {
    return this.getObjects({
      sourceId,
      showContainers,
      ...(kind === 'group'
        ? {groupDn: branchId, scope: 'subtree' as const}
        : {baseDn: branchId}),
      tasks: true,
      maxResults,
    });
  }

  async resolveSubtree({
    sourceId,
    branchId,
    kind,
    showContainers,
  }: DirectoryBranchParams) {
    const requireComplete = (listing: DirectoryOverview) => {
      if (listing.truncated)
        throw new Error(
          'Directory results are incomplete. Your selection has been preserved.',
        );
    };
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

      if (branchKind === 'group') {
        const {data: listing} = await this.getChildren({
          sourceId,
          branchId: id,
          kind: branchKind,
          showContainers,
        });
        requireComplete(listing);
        graph = replaceDirectorySnapshot(
          graph,
          id,
          'resolution',
          listing.roots,
          true,
        );
        for (const node of listing.roots)
          if (node.kind !== 'computer')
            await visitBranch(node.id, node.kind, nextPath);
        return;
      }

      const {data: listing} = await this.getObjects({
        sourceId,
        baseDn: id,
        scope: 'subtree',
        showContainers,
        tasks: true,
      });
      requireComplete(listing);
      const branchIds = [
        id,
        ...listing.roots
          .filter(node => node.kind === 'ou' || node.kind === 'container')
          .map(node => node.id),
      ];
      for (const parentId of branchIds)
        graph = replaceDirectorySnapshot(
          graph,
          parentId,
          'resolution',
          listing.roots.filter(node => node.parentDn === parentId),
          true,
        );
      for (const node of listing.roots)
        if (node.kind === 'group')
          await visitBranch(node.id, node.kind, nextPath);
    };

    await visitBranch(branchId, kind, new Set());
    const members = getDirectoryMembers(graph, branchId);
    if (!members.complete)
      throw new Error(
        'Directory results are incomplete. Your selection has been preserved.',
      );
    return new Response<DirectoryResolution>({
      computers: members.computers,
      graph,
    });
  }
}

export default ActiveDirectoryCommand;
