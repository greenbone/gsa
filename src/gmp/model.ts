/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Capabilities from 'gmp/capabilities/capabilities';
import {Date as GmpDate} from 'gmp/models/date';
import {
  parseProperties as parseDefaultProperties,
  parseYesNo,
  parseDate,
  parseBoolean,
  parseText,
  setProperties,
  NO_VALUE,
  YES_VALUE,
  parseToString,
  ParsedProperties,
  ElementProperties,
  YesNo,
  Properties,
} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export type Element = Record<string, unknown>;

interface Permission {
  name: string;
}

export interface Owner {
  name: string;
}

export interface ModelElement extends ElementProperties {
  name?: string;
  end_time?: string;
  timestamp?: string;
  permissions?: {
    permission: Permission[];
  };
  user_tags?: {
    tag: Element[];
  };
  writable?: string;
  orphan?: string;
  active?: string;
  trash?: string;
  in_use?: string;
  owner?: Owner;
  summary?: string;
  comment?: string;
}

export interface ModelProperties extends ParsedProperties {
  active?: YesNo;
  comment?: string;
  endTime?: GmpDate;
  entityType: string;
  inUse?: boolean;
  name?: string;
  orphan?: YesNo;
  owner?: Owner;
  summary?: string;
  timestamp?: GmpDate;
  trash?: YesNo;
  userCapabilities: Capabilities;
  userTags: Model[];
  writable?: YesNo;
}

export const parseModelFromElement = (
  element: ModelElement,
  entityType: string,
) => {
  const m = new Model(entityType);
  const props = Model.parseElement(element);
  m.setProperties(props);
  return m;
};

class Model implements ModelProperties {
  static entityType = 'unknown';

  _type?: string;
  active?: YesNo;
  comment?: string;
  creationTime?: GmpDate;
  endTime?: GmpDate;
  entityType: string;
  id?: string;
  inUse?: boolean;
  modificationTime?: GmpDate;
  name?: string;
  orphan?: YesNo;
  summary?: string;
  timestamp?: GmpDate;
  trash?: YesNo;
  userCapabilities!: Capabilities;
  userTags!: Model[];
  writable?: YesNo;

  constructor(type?: string) {
    const fallbackEntityType = (this.constructor as typeof Model).entityType;
    this.entityType = isDefined(type) ? type : fallbackEntityType;
  }

  setProperties(properties: ParsedProperties) {
    return setProperties(properties as Properties, this);
  }

  getProperties(): Properties {
    return Object.entries(this).reduce((prev, [key, value]) => {
      prev[key] = value;
      return prev;
    }, {});
  }

  static fromElement<TModel>(element: Element = {}, type?: string): TModel {
    const f = new this(type);
    f.setProperties(this.parseElement(element));
    return f as TModel;
  }

  static parseElement(element: ModelElement = {}): ModelProperties {
    // in future parseDefaultProperties should only return known properties
    // and not the whole object
    // for now we need to delete the properties we don't want
    const copy = parseDefaultProperties(element) as ModelProperties;

    if (isDefined(element.name)) {
      copy.name = parseToString(element.name);
    }

    if (isDefined(element.end_time)) {
      if (element.end_time.length > 0) {
        copy.endTime = parseDate(element.end_time);
      }
      // @ts-expect-error
      delete copy.end_time;
    }

    if (isDefined(element.timestamp)) {
      if (element.timestamp.length > 0) {
        copy.timestamp = parseDate(element.timestamp);
      }
    }

    if (isDefined(element.permissions)) {
      // these are the permissions the current user has on the entity
      const caps = map(element.permissions.permission, perm => perm.name);
      copy.userCapabilities = new Capabilities(caps);
      // @ts-expect-error
      delete copy.permissions;
    } else {
      copy.userCapabilities = new Capabilities();
    }

    if (isDefined(element.user_tags)) {
      copy.userTags = map(element.user_tags.tag, tag => {
        return parseModelFromElement(tag, 'tag');
      });
      // @ts-expect-error
      delete copy.user_tags;
    } else {
      copy.userTags = [];
    }

    const yesNoProps = ['writable', 'orphan', 'active', 'trash'];

    for (const name of yesNoProps) {
      const prop = element[name];
      if (isDefined(prop)) {
        copy[name] = parseYesNo(prop);
      }
    }

    if (isDefined(element.in_use)) {
      copy.inUse = parseBoolean(element.in_use);
      // @ts-expect-error
      delete copy.in_use;
    }

    // currently the owner is already added by parseDefaultProperties but in
    // the future this will change. therefore we need to add it here
    copy.owner = element.owner;

    if (isDefined(element.owner) && isEmpty(element.owner.name)) {
      delete copy.owner;
    }

    copy.summary = parseText(element.summary);

    if (isEmpty(element.summary)) {
      delete copy.summary;
    }

    copy.comment = parseText(element.comment);

    if (isEmpty(element.comment)) {
      delete copy.comment;
    }

    return copy;
  }

  isInUse() {
    return this.inUse === true;
  }

  isInTrash() {
    return this.trash === YES_VALUE;
  }

  isWritable() {
    return this.writable !== NO_VALUE;
  }

  isOrphan() {
    return this.orphan === YES_VALUE;
  }

  isActive() {
    return this.active !== NO_VALUE;
  }
}

export default Model;
