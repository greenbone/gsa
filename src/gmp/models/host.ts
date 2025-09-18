/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import BaseModel, {
  BaseModelProperties,
  parseBaseModelProperties,
} from 'gmp/models/basemodel';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {
  parseBoolean,
  parseInt,
  parseSeverity,
  parseYesNo,
  YesNo,
} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

interface Source {
  data?: string;
  deleted?: boolean;
  id?: string;
  source_type?: string;
}

interface IdentifierProperties extends BaseModelProperties {
  name?: string;
  os?: {
    id?: string;
  };
  source?: Source;
  value?: string;
}

interface IdentifierElement extends ModelElement {
  os?: {
    id?: string;
  };
  source?: {
    _id?: string;
    data?: string;
    deleted?: number;
    type?: string;
  };
  value?: string;
}

interface HostDetailElement {
  name: string;
  value?: string;
  source?: {
    _id?: string;
    type?: string;
  };
}

interface HostRouteElement {
  _id?: string;
  _distance?: string;
  _same_source?: string;
  ip?: string;
}

interface RouteElement {
  host?: HostRouteElement | HostRouteElement[];
}

interface HostElement extends ModelElement {
  host?: {
    severity?: {value: string};
    detail?: HostDetailElement | HostDetailElement[];
    routes?: {
      route: RouteElement | RouteElement[];
    };
  };
  identifiers?: {
    identifier: IdentifierElement | IdentifierElement[];
  };
}

interface Route {
  ip?: string;
  id?: string;
  distance?: number;
  same_source?: YesNo;
}

interface HostDetailSource {
  id?: string;
  type?: string;
}

interface HostDetail {
  value?: string;
  source?: HostDetailSource;
}

interface HostDetails {
  best_os_cpe?: HostDetail;
  best_os_txt?: HostDetail;
  [key: string]: HostDetail | undefined;
}

interface HostProperties extends ModelProperties {
  details?: HostDetails;
  hostname?: string;
  identifiers?: Identifier[];
  ip?: string;
  os?: string;
  routes?: Route[][];
  severity?: number;
}

const getIdentifier = (
  identifiers: Identifier[],
  name: string,
): Identifier | undefined =>
  identifiers.find(identifier => identifier.name === name);

class Identifier extends BaseModel {
  readonly name?: string;
  readonly os?: {
    id?: string;
  };
  readonly source?: Source;
  readonly value?: string;

  constructor({name, source, os, value, ...props}: IdentifierProperties) {
    super(props);

    this.name = name;
    this.os = os;
    this.source = source;
    this.value = value;
  }

  static fromElement(element: IdentifierElement): Identifier {
    const ret = parseBaseModelProperties(element) as IdentifierProperties;

    ret.name = element.name;

    if (isDefined(element.source)) {
      ret.source = {
        data: element.source.data,
        id: element.source._id,
        source_type: element.source.type,
        deleted: isDefined(element.source.deleted)
          ? parseBoolean(element.source.deleted)
          : undefined,
      };
    }
    if (isDefined(element.os)) {
      ret.os = {
        id: element.os.id,
      };
    }
    return new Identifier(ret);
  }
}

class Host extends Model {
  static readonly entityType = 'host';

  readonly details?: HostDetails;
  readonly hostname?: string;
  readonly identifiers: Identifier[];
  readonly ip?: string;
  readonly os?: string;
  readonly routes?: Route[][];
  readonly severity?: number;

  constructor({
    details,
    hostname,
    identifiers = [],
    ip,
    os,
    routes = [],
    severity,
    ...properties
  }: HostProperties = {}) {
    super(properties);

    this.details = details;
    this.hostname = hostname;
    this.identifiers = identifiers;
    this.ip = ip;
    this.os = os;
    this.routes = routes;
    this.severity = severity;
  }

  static fromElement(element?: HostElement): Host {
    return new Host(this.parseElement(element));
  }

  static parseElement(element: HostElement = {}): HostProperties {
    const ret = super.parseElement(element) as HostProperties;

    if (isDefined(element.host?.severity)) {
      ret.severity = parseSeverity(element.host.severity.value);
    }

    ret.identifiers = map(element.identifiers?.identifier, identifier => {
      return Identifier.fromElement(identifier);
    });

    const hostname =
      getIdentifier(ret.identifiers, 'hostname') ??
      getIdentifier(ret.identifiers, 'DNS-via-TargetDefinition');
    const ip = getIdentifier(ret.identifiers, 'ip');

    ret.hostname = hostname?.value;
    ret.ip = ip?.value;

    if (isDefined(element.host)) {
      ret.details = {};

      forEach(element.host.detail, details => {
        // @ts-expect-error 'ret.details' is possibly 'undefined'
        ret.details[details.name] = {
          value: details.value,
          source: {
            id: details.source?._id,
            type: details.source?.type,
          },
        };
      });

      if (isDefined(element.host.routes)) {
        ret.routes = map(element.host?.routes.route, route =>
          map(route.host, host => ({
            ip: host.ip,
            id: isEmpty(host._id) ? undefined : host._id,
            distance: parseInt(host._distance),
            same_source: parseYesNo(host._same_source), // host/hop was found in the same scan
          })),
        );
      }
    } else {
      ret.routes = [];
    }

    if (isDefined(ret.details?.best_os_cpe)) {
      ret.os = ret.details.best_os_cpe.value;
    } else if (isDefined(ret.identifiers)) {
      const firstOs = getIdentifier(ret.identifiers, 'OS');
      ret.os = firstOs?.value;
    } else {
      ret.os = undefined;
    }

    return ret;
  }
}

export default Host;
