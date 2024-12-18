/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  parseBoolean,
  parseInt,
  parseProperties,
  parseSeverity,
  parseYesNo,
  setProperties,
} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import Asset from './asset';

const get_identifier = (identifiers, name) =>
  identifiers.filter(identifier => identifier.name === name)[0];

const newProperties = (properties, object = {}) =>
  setProperties(parseProperties(properties, object));

class Identifier {
  constructor(element) {
    const props = parseProperties(element);

    if (isDefined(props.source)) {
      props.source = newProperties({
        ...props.source,
        source_type: props.source.type,
        deleted: parseBoolean(props.source.deleted),
      });
    }

    if (isDefined(props.os)) {
      props.os = newProperties(props.os);
    }

    setProperties(props, this);
  }
}

class Host extends Asset {
  static entityType = 'host';

  static parseElement(element) {
    const ret = super.parseElement(element);

    if (isDefined(ret.host) && isDefined(ret.host.severity)) {
      ret.severity = parseSeverity(ret.host.severity.value);
    }

    if (isDefined(ret.identifiers)) {
      ret.identifiers = map(ret.identifiers.identifier, identifier => {
        return new Identifier(identifier);
      });
    } else {
      ret.identifiers = [];
    }

    let hostname = get_identifier(ret.identifiers, 'hostname');

    if (!isDefined(hostname)) {
      hostname = get_identifier(ret.identifiers, 'DNS-via-TargetDefinition');
    }

    const ip = get_identifier(ret.identifiers, 'ip');

    ret.hostname = isDefined(hostname) ? hostname.value : undefined;
    ret.ip = isDefined(ip) ? ip.value : undefined;

    ret.details = {};

    if (isDefined(ret.host)) {
      forEach(ret.host.detail, details => {
        ret.details[details.name] = {
          value: details.value,
          source: newProperties(details.source),
        };
      });

      if (isDefined(ret.host.routes)) {
        ret.routes = map(ret.host.routes.route, route =>
          map(route.host, host => ({
            ip: host.ip,
            id: isEmpty(host._id) ? undefined : host._id,
            distance: parseInt(host._distance),
            same_source: parseYesNo(host._same_source), // host/hop was found in the same scan
          })),
        );
      }

      delete ret.host;
    } else {
      ret.routes = [];
    }

    if (isDefined(ret.details) && isDefined(ret.details.best_os_cpe)) {
      ret.os = ret.details.best_os_cpe.value;
    } else if (isDefined(ret.identifiers)) {
      const firstOs = ret.identifiers.find(
        identifier => identifier.name === 'OS',
      );
      ret.os = isDefined(firstOs) ? firstOs.value : undefined;
    } else {
      ret.os = undefined;
    }

    return ret;
  }
}

export default Host;
