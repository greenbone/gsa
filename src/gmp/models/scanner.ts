/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import Credential from 'gmp/models/credential';
import {type Date} from 'gmp/models/date';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseYesNo, parseDate, type YesNo, parseInt} from 'gmp/parser';
import {type ToString} from 'gmp/types';
import {map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export type ScannerType =
  (typeof SCANNER_TYPE_DEFINITIONS)[keyof typeof SCANNER_TYPE_DEFINITIONS]['value'];

export type ContainerImageScannerType = typeof CONTAINER_IMAGE_SCANNER_TYPE;

interface InfoElement {
  name?: string;
  version?: string;
}

interface ScannerParamElement {
  default?: string | number;
  description?: string;
  mandatory?: YesNo;
  name: string;
  paramType?: string;
}

interface ScannerTaskElement {
  _id: string;
  name?: string;
  usage_type: 'scan' | 'audit';
}

export interface ScannerElement extends ModelElement {
  ca_pub?: string;
  ca_pub_info?: {
    activation_time?: string;
    expiration_time?: string;
  };
  configs?: {
    config?: ModelElement | ModelElement[];
  };
  credential?: ModelElement;
  info?: {
    daemon?: InfoElement;
    description?: string;
    params?: {
      param?: ScannerParamElement | ScannerParamElement[];
    };
    protocol?: InfoElement;
    scanner?: InfoElement;
  };
  host?: string;
  port?: number;
  relay_host?: string;
  relay_port?: number;
  tasks?: {
    task?: ScannerTaskElement | ScannerTaskElement[];
  };
}

interface Info {
  name?: string;
  version?: string;
}

interface ScannerInfo {
  daemon?: Info;
  description?: string;
  params?: ScannerParam[];
  protocol?: Info;
  scanner?: Info;
}

interface ScannerParam {
  default?: string | number;
  description?: string;
  mandatory?: YesNo;
  name: string;
  paramType?: string;
}

interface CaPub {
  certificate?: string;
  info?: {
    activationTime?: Date;
    expirationTime?: Date;
  };
}

interface ScannerTask {
  id: string;
  name?: string;
  usageType: 'scan' | 'audit';
}

interface ScannerProperties extends ModelProperties {
  caPub?: CaPub;
  configs?: Model[];
  credential?: Credential;
  info?: ScannerInfo;
  host?: string;
  port?: number;
  scannerType?: ScannerType;
  tasks?: ScannerTask[];
}

// Scanner type definitions - add new scanner types here with their display names
export const SCANNER_TYPE_DEFINITIONS = {
  OPENVAS_SCANNER_TYPE: {value: '2', name: _l('OpenVAS Scanner')},
  CVE_SCANNER_TYPE: {value: '3', name: _l('CVE Scanner')},
  GREENBONE_SENSOR_SCANNER_TYPE: {value: '5', name: _l('Greenbone Sensor')},
  OPENVASD_SCANNER_TYPE: {value: '6', name: _l('OpenVASD Scanner')},
  OPENVASD_SENSOR_SCANNER_TYPE: {value: '8', name: _l('OpenVASD Sensor')},
  AGENT_CONTROLLER_SCANNER_TYPE: {value: '7', name: _l('Agent Controller')},
  AGENT_CONTROLLER_SENSOR_SCANNER_TYPE: {value: '9', name: _l('Agent Sensor')},
  CONTAINER_IMAGE_SCANNER_TYPE: {
    value: '10',
    name: _l('Container Image Scanner'),
  },
} as const;

// Extract individual constants
export const OPENVAS_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.OPENVAS_SCANNER_TYPE.value;
export const CVE_SCANNER_TYPE = SCANNER_TYPE_DEFINITIONS.CVE_SCANNER_TYPE.value;
export const GREENBONE_SENSOR_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.GREENBONE_SENSOR_SCANNER_TYPE.value;
export const OPENVASD_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.OPENVASD_SCANNER_TYPE.value;
export const AGENT_CONTROLLER_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.AGENT_CONTROLLER_SCANNER_TYPE.value;
export const OPENVASD_SENSOR_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.OPENVASD_SENSOR_SCANNER_TYPE.value;
export const AGENT_CONTROLLER_SENSOR_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.AGENT_CONTROLLER_SENSOR_SCANNER_TYPE.value;
export const CONTAINER_IMAGE_SCANNER_TYPE =
  SCANNER_TYPE_DEFINITIONS.CONTAINER_IMAGE_SCANNER_TYPE.value;

// Mapping of scanner types to their display names (automatically generated)
export const SCANNER_TYPE_NAMES = Object.fromEntries(
  Object.values(SCANNER_TYPE_DEFINITIONS).map(def => [def.value, def.name]),
) as Record<string, ToString>;

export const OPENVAS_DEFAULT_SCANNER_ID =
  '08b69003-5fc2-4037-a479-93b440211c73';

export const CONTAINER_IMAGE_DEFAULT_SCANNER_ID =
  '1facb485-10e8-4520-9110-66f929d9ac2e';

export const openVasScannersFilter = (config: {scannerType: ScannerType}) =>
  config.scannerType === OPENVAS_SCANNER_TYPE;

export function scannerTypeName(
  scannerType: number | string | undefined,
): string {
  const typeStr = isDefined(scannerType) ? String(scannerType) : undefined;

  if (!isDefined(typeStr) || typeStr.length === 0) {
    return _('Unknown scanner type');
  }

  if (isDefined(scannerType) && scannerType in SCANNER_TYPE_NAMES) {
    return String(SCANNER_TYPE_NAMES[typeStr]);
  }

  return _('Unknown scanner type ({{type}})', {type: typeStr});
}

const parseScannerInfo = (info: InfoElement = {}): Info => {
  return {
    name: isEmpty(info.name) ? undefined : info.name,
    version: isEmpty(info.version) ? undefined : info.version,
  };
};

class Scanner extends Model {
  static readonly entityType = 'scanner';

  readonly caPub?: CaPub;
  readonly configs: Model[];
  readonly credential?: Credential;
  readonly info?: ScannerInfo;
  readonly host?: string;
  readonly port?: number;
  readonly scannerType?: ScannerType;
  readonly tasks: ScannerTask[];

  constructor({
    caPub,
    configs = [],
    credential,
    info,
    host,
    port,
    scannerType,
    tasks = [],
    ...properties
  }: ScannerProperties = {}) {
    super(properties);

    this.caPub = caPub;
    this.configs = configs;
    this.credential = credential;
    this.info = info;
    this.host = host;
    this.port = port;
    this.scannerType = scannerType;
    this.tasks = tasks;
  }

  static fromElement(element?: ScannerElement): Scanner {
    return new Scanner(this.parseElement(element));
  }

  static parseElement(element: ScannerElement = {}): ScannerProperties {
    const ret = super.parseElement(element) as ScannerProperties;

    ret.scannerType = isDefined(element.type)
      ? (String(element.type) as ScannerType)
      : undefined;
    delete ret._type;

    ret.port = isDefined(element.port) ? parseInt(element.port) : undefined;

    ret.credential =
      isDefined(element.credential) && !isEmpty(element.credential._id)
        ? (Credential.fromElement(element.credential) as Credential)
        : undefined;

    if (!isEmpty(element.ca_pub)) {
      ret.caPub = {
        certificate: element.ca_pub,
      };

      if (isDefined(element.ca_pub_info)) {
        ret.caPub.info = {
          activationTime: parseDate(element.ca_pub_info.activation_time),
          expirationTime: parseDate(element.ca_pub_info.expiration_time),
        };
      }
    }

    ret.tasks = map(element.tasks?.task, task => {
      return {
        id: task._id as string,
        name: task.name,
        usageType: task.usage_type as 'scan' | 'audit',
      };
    });
    ret.configs = map(element.configs?.config, config =>
      Model.fromElement(config, 'scanconfig'),
    );

    if (isDefined(element.info)) {
      const {scanner, daemon, description, params, protocol} = element.info;
      ret.info = {
        scanner: parseScannerInfo(scanner),
        daemon: parseScannerInfo(daemon),
        protocol: parseScannerInfo(protocol),
        description: isEmpty(description) ? undefined : description,
        params: map(params?.param, param => ({
          name: param.name,
          description: param.description,
          paramType: param.paramType,
          mandatory: parseYesNo(param.mandatory),
          default: param.default,
        })),
      };
    }

    return ret;
  }

  isCloneable() {
    return (
      this.scannerType !== CVE_SCANNER_TYPE &&
      this.scannerType !== OPENVASD_SCANNER_TYPE
    );
  }

  isWritable() {
    return (
      super.isWritable() &&
      this.scannerType !== CVE_SCANNER_TYPE &&
      this.scannerType !== OPENVASD_SCANNER_TYPE
    );
  }

  hasUnixSocket() {
    return isString(this.host) && this.host[0] === '/';
  }
}

export default Scanner;
