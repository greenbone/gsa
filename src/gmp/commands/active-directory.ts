/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {XMLParser} from 'fast-xml-parser';
import HttpCommand from 'gmp/commands/http';
import Response from 'gmp/http/response';
import {success} from 'gmp/http/transform/xml';
import {
  type DirectoryBranch,
  type DirectoryComputer,
  type DirectoryNode,
  type DirectoryOverview,
  type DirectoryTarget,
} from 'gmp/models/active-directory';
import {resolveDirectorySubtree} from 'gmp/models/directory-resolution';
import {isDefined} from 'gmp/utils/identity';

export interface DirectorySourceParams {
  sourceId: string;
  showContainers?: boolean;
}

export interface DirectoryBranchParams extends DirectorySourceParams {
  branchId: string;
  kind: DirectoryBranch['kind'];
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
      computer: {total: string; disabled?: string};
    };
    object?: ObjectElement | ObjectElement[];
  };
}

interface DirectoryDocument {
  envelope?: {
    get_active_directory_objects?: {
      get_active_directory_objects_response?: ObjectsResponse;
    };
  };
}

const directoryXmlParser = new XMLParser({
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  removeNSPrefix: true,
  textNodeName: '__text',
  // Fast XML Parser enables general numeric character references with this option.
  htmlEntities: true,
  parseTagValue: false,
  trimValues: false,
});

const parseDirectoryResponse = success(
  (response: Response<string | ArrayBuffer | DirectoryDocument>) => {
    const {data} = response;
    const xml =
      data instanceof ArrayBuffer ? new TextDecoder().decode(data) : data;
    const {envelope} =
      typeof xml === 'string'
        ? (directoryXmlParser.parse(xml) as DirectoryDocument)
        : xml;
    if (!isDefined(envelope)) throw new Error('No envelope found in response');
    return response.setData(envelope);
  },
);

const array = <T>(value?: T | T[]): T[] => {
  if (!isDefined(value)) return [];
  return Array.isArray(value) ? value : [value];
};

const reference = (value: ReferenceElement) => ({
  id: value._id,
  name: value.name,
});

const parseTarget = (target: TargetElement): DirectoryTarget => {
  const result: DirectoryTarget = reference(target);
  if (isDefined(target.tasks)) {
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
  const matchedTargets: DirectoryTarget[] | undefined = !isDefined(
    object.targets,
  )
    ? undefined
    : array(object.targets.target).map(parseTarget);
  return {
    ...common,
    kind: 'computer',
    hostname: object.dns_hostname || undefined,
    disabled: String(object.disabled) === '1',
    operatingSystem: object.operating_system || undefined,
    operatingSystemVersion: object.operating_system_version || undefined,
    servicePrincipalNames: !isDefined(object.service_principal_names)
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
  }: DirectoryObjectsParams) {
    const args = this.getParams({
      cmd: 'get_active_directory_objects',
      credential_id: sourceId,
      scope,
      include_disabled_computers: Number(includeDisabledComputers),
      targets: Number(targets || tasks),
      tasks: Number(tasks),
      ...(details ? {details: 1} : {}),
      ...(!isDefined(baseDn) ? {} : {base_dn: baseDn}),
      ...(!isDefined(groupDn) ? {} : {group_dn: groupDn}),
      ...(!isDefined(objectTypes) ? {} : {'object_types:': objectTypes}),
    });
    const rawResponse = await this.httpRequestWithRejectionTransform('get', {
      args,
    });
    const response = parseDirectoryResponse(rawResponse);
    const wrapper = response.data.get_active_directory_objects;
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
    const matched = computers.every(computer =>
      isDefined(computer.matchedTargets),
    );
    const overview: DirectoryOverview = {
      roots,
      truncated: String(objects._truncated) === '1',
      counts: {
        found: Number(objects.count.computer.total),
        disabled: !isDefined(objects.count.computer.disabled)
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
    return this.getObjects({
      ...params,
      tasks: true,
    });
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
      tasks: true,
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
  }: DirectoryBranchParams) {
    return this.getObjects({
      sourceId,
      showContainers,
      ...(kind === 'group'
        ? {groupDn: branchId, scope: 'subtree' as const}
        : {baseDn: branchId}),
      tasks: true,
    });
  }

  async resolveSubtree({
    sourceId,
    branchId,
    kind,
    showContainers,
  }: DirectoryBranchParams) {
    const resolution = await resolveDirectorySubtree(
      branchId,
      kind,
      async (id, branchKind) => {
        const response =
          branchKind === 'group'
            ? await this.getChildren({
                sourceId,
                branchId: id,
                kind: branchKind,
                showContainers,
              })
            : await this.getObjects({
                sourceId,
                baseDn: id,
                scope: 'subtree',
                // Hidden containers are still needed to link subtree members.
                showContainers: true,
                tasks: true,
              });
        return response.data;
      },
    );
    return new Response(resolution);
  }
}

export default ActiveDirectoryCommand;
