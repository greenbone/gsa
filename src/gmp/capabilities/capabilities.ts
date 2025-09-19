/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {map} from 'gmp/utils/array';
import {
  API_TYPES,
  ApiType,
  apiType,
  EntityType,
  pluralizeType,
} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

export type Capability = (typeof CAPABILITY_NAMES)[number];
export type CapabilitiesEntityType = ApiType | EntityType;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CAPABILITY_NAMES = [
  // the list may not be complete yet
  'everything',
  'authenticate',
  'create_agent_group',
  'create_alert',
  'create_asset',
  'create_config',
  'create_credential',
  'create_filter',
  'create_group',
  'create_note',
  'create_override',
  'create_permission',
  'create_port_list',
  'create_port_range',
  'create_report',
  'create_report_config',
  'create_report_format',
  'create_role',
  'create_scanner',
  'create_schedule',
  'create_tag',
  'create_target',
  'create_task',
  'create_ticket',
  'create_tls_certificate',
  'create_user',
  'delete_agent_group',
  'delete_agent',
  'delete_alert',
  'delete_asset',
  'delete_config',
  'delete_credential',
  'delete_filter',
  'delete_group',
  'delete_note',
  'delete_override',
  'delete_permission',
  'delete_port_list',
  'delete_port_range',
  'delete_report',
  'delete_report_config',
  'delete_report_format',
  'delete_role',
  'delete_scanner',
  'delete_schedule',
  'delete_tag',
  'delete_target',
  'delete_task',
  'delete_ticket',
  'delete_tls_certificate',
  'delete_user',
  'describe_auth',
  'empty_trashcan',
  'get_agent_groups',
  'get_agent_installers',
  'get_agents',
  'get_aggregates',
  'get_alerts',
  'get_assets',
  'get_configs',
  'get_credentials',
  'get_feeds',
  'get_filters',
  'get_groups',
  'get_info',
  'get_notes',
  'get_nvts',
  'get_nvt_families',
  'get_overrides',
  'get_permissions',
  'get_port_lists',
  'get_preferences',
  'get_reports',
  'get_report_configs',
  'get_report_formats',
  'get_results',
  'get_roles',
  'get_scanners',
  'get_schedules',
  'get_settings',
  'get_system_reports',
  'get_tags',
  'get_targets',
  'get_tasks',
  'get_tickets',
  'get_tls_certificates',
  'get_users',
  'get_version',
  'get_vulns',
  'help',
  'modify_agent_group',
  'modify_agent',
  'modify_alert',
  'modify_asset',
  'modify_auth',
  'modify_config',
  'modify_credential',
  'modify_filter',
  'modify_group',
  'modify_note',
  'modify_override',
  'modify_permission',
  'modify_port_list',
  'modify_report_config',
  'modify_report_format',
  'modify_role',
  'modify_scanner',
  'modify_schedule',
  'modify_setting',
  'modify_tag',
  'modify_target',
  'modify_task',
  'modify_ticket',
  'modify_tls_certificate',
  'modify_user',
  'move_task',
  'restore',
  'resume_task',
  'run_wizard',
  'start_task',
  'stop_task',
  'sync_config',
  'test_alert',
  'verify_report_format',
  'verify_scanner',
] as const;

const convertType = (type: CapabilitiesEntityType): string => {
  // for now be safe and allow using all kinds of types including plural ones
  // despite the CapabilitiesType definition reduces the possible values
  // to not break existing code. This can be changed later to be more strict.
  const singularType = type.endsWith('s') ? type.slice(0, -1) : type;
  if (singularType in API_TYPES) {
    return singularType;
  }
  const at = apiType(singularType as ApiType);
  return at as string;
};

class Capabilities {
  private readonly _hasCaps: boolean;
  private readonly _capabilities: Set<Capability>;

  constructor(capNames?: Capability[]) {
    this._hasCaps = isDefined(capNames);

    const caps: Capability[] = map<Capability, Capability>(
      capNames,
      name => name.toLowerCase() as Capability,
    );
    this._capabilities = new Set(caps);
  }

  [Symbol.iterator]() {
    return this._capabilities[Symbol.iterator]();
  }

  areDefined() {
    return this._hasCaps;
  }

  protected has(name: Capability) {
    return this._capabilities.has(name.toLowerCase() as Capability);
  }

  mayOp(value: Capability) {
    return this.has(value) || this.has('everything');
  }

  mayAccess(type: CapabilitiesEntityType) {
    return this.mayOp(
      ('get_' + pluralizeType(convertType(type))) as Capability,
    );
  }

  mayClone(type: CapabilitiesEntityType) {
    return this.mayOp(('create_' + convertType(type)) as Capability);
  }

  mayEdit(type: CapabilitiesEntityType) {
    return this.mayOp(('modify_' + convertType(type)) as Capability);
  }

  mayDelete(type: CapabilitiesEntityType) {
    return this.mayOp(('delete_' + convertType(type)) as Capability);
  }

  mayCreate(type: CapabilitiesEntityType) {
    return this.mayOp(('create_' + convertType(type)) as Capability);
  }

  get length() {
    return this._capabilities.size;
  }

  map<T>(callbackfn: (value: Capability, index: number, array: string[]) => T) {
    return Array.from(this._capabilities).map(callbackfn);
  }
}

export default Capabilities;
