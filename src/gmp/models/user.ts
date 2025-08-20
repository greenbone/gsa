/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseCsv} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export interface UserElement extends ModelElement {
  role?: ModelElement[] | ModelElement;
  groups?: {
    group: ModelElement[];
  };
  hosts?: {
    __text: string;
    _allow?: string;
  };
  sources?: {
    source: string;
  };
}

interface Hosts {
  addresses: string[];
  allow?: string;
}

export interface UserProperties extends ModelProperties {
  roles?: Model[];
  groups?: Model[];
  hosts?: Hosts;
  authMethod?: string;
}

export const AUTH_METHOD_PASSWORD = 'password';
export const AUTH_METHOD_NEW_PASSWORD = 'newpassword';
export const AUTH_METHOD_LDAP = 'ldap';
export const AUTH_METHOD_RADIUS = 'radius';

export const ACCESS_ALLOW_ALL = '0';
export const ACCESS_DENY_ALL = '1';

const SUPERADMIN_ROLE_ID = '9c5a6ec6-6fe2-11e4-8cb6-406186ea4fc5';

class User extends Model {
  static entityType: string = 'user';

  readonly roles: Model[];
  readonly groups: Model[];
  readonly hosts?: Hosts;
  readonly authMethod?: string;

  constructor({
    roles = [],
    groups = [],
    hosts,
    authMethod,
    ...properties
  }: UserProperties = {}) {
    super(properties);

    this.roles = roles;
    this.groups = groups;
    this.hosts = hosts;
    this.authMethod = authMethod;
  }

  static fromElement(element: UserElement = {}): User {
    return new User(this.parseElement(element));
  }

  static parseElement(element: UserElement): UserProperties {
    const ret = super.parseElement(element) as UserProperties;

    ret.roles = map(element.role, role => Model.fromElement(role, 'role'));

    // @ts-expect-error
    delete ret.role;

    if (!isDefined(element.groups)) {
      ret.groups = [];
    } else {
      ret.groups = map(element.groups.group, group =>
        Model.fromElement(group, 'group'),
      );
    }

    if (isDefined(element.hosts)) {
      ret.hosts = {
        addresses: parseCsv(element.hosts.__text),
        allow: element.hosts._allow,
      };
    } else {
      ret.hosts = {
        addresses: [],
      };
    }

    if (isDefined(element.sources)) {
      const {source} = element.sources;
      if (source === 'ldap_connect') {
        ret.authMethod = AUTH_METHOD_LDAP;
      } else if (source === 'radius_connect') {
        ret.authMethod = AUTH_METHOD_RADIUS;
      }
      // @ts-expect-error
      delete ret.sources;
    } else {
      ret.authMethod = AUTH_METHOD_PASSWORD;
    }

    return ret;
  }

  isSuperAdmin() {
    return isDefined(
      this.roles.find(element => element.id === SUPERADMIN_ROLE_ID),
    );
  }
}

export default User;
