/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import Credential from 'gmp/models/credential';
import {Date} from 'gmp/models/date';
import Model, {ModelElement, ModelProperties} from 'gmp/models/model';
import {parseYesNo, parseDate, YesNo} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined, isString} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

export type ScannerType =
  | typeof OPENVAS_SCANNER_TYPE
  | typeof CVE_SCANNER_TYPE
  | typeof GREENBONE_SENSOR_SCANNER_TYPE
  | typeof OPENVASD_SCANNER_TYPE
  | typeof AGENT_CONTROLLER_SCANNER_TYPE
  | typeof OPENVASD_SENSOR_SCANNER_TYPE
  | typeof AGENT_CONTROLLER_SENSOR_SCANNER_TYPE;

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
    task?: ModelElement | ModelElement[];
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

interface ScannerProperties extends ModelProperties {
  caPub?: CaPub;
  configs?: Model[];
  credential?: Credential;
  info?: ScannerInfo;
  host?: string;
  scannerType?: ScannerType;
  tasks?: Model[];
}

export const OPENVAS_SCANNER_TYPE = '2';
export const CVE_SCANNER_TYPE = '3';
export const GREENBONE_SENSOR_SCANNER_TYPE = '5';
export const OPENVASD_SCANNER_TYPE = '6';
export const AGENT_CONTROLLER_SCANNER_TYPE = '7';
export const OPENVASD_SENSOR_SCANNER_TYPE = '8';
export const AGENT_CONTROLLER_SENSOR_SCANNER_TYPE = '9';

export const OPENVAS_DEFAULT_SCANNER_ID =
  '08b69003-5fc2-4037-a479-93b440211c73';

export const openVasScannersFilter = (config: {scannerType: ScannerType}) =>
  config.scannerType === OPENVAS_SCANNER_TYPE;

export function scannerTypeName(
  scannerType: number | string | undefined,
): string {
  scannerType = isDefined(scannerType) ? String(scannerType) : undefined;
  if (scannerType === OPENVAS_SCANNER_TYPE) {
    return _('OpenVAS Scanner');
  } else if (scannerType === CVE_SCANNER_TYPE) {
    return _('CVE Scanner');
  } else if (scannerType === GREENBONE_SENSOR_SCANNER_TYPE) {
    return _('Greenbone Sensor');
  } else if (scannerType === OPENVASD_SCANNER_TYPE) {
    return _('OpenVASD Scanner');
  } else if (scannerType === OPENVASD_SENSOR_SCANNER_TYPE) {
    return _('OpenVASD Sensor');
  } else if (scannerType === AGENT_CONTROLLER_SCANNER_TYPE) {
    return _('Agent Scanner');
  } else if (scannerType === AGENT_CONTROLLER_SENSOR_SCANNER_TYPE) {
    return _('Agent Sensor');
  } else if (isDefined(scannerType)) {
    return _('Unknown scanner type ({{type}})', {type: scannerType});
  }
  return _('Unknown scanner type');
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
  readonly scannerType?: ScannerType;
  readonly tasks: Model[];

  constructor({
    caPub,
    configs = [],
    credential,
    info,
    host,
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

    ret.tasks = map(element.tasks?.task, task =>
      Model.fromElement(task, 'task'),
    );
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
      this.scannerType !== OPENVAS_SCANNER_TYPE
    );
  }

  isWritable() {
    return (
      super.isWritable() &&
      this.scannerType !== CVE_SCANNER_TYPE &&
      this.scannerType !== OPENVAS_SCANNER_TYPE
    );
  }

  hasUnixSocket() {
    return isString(this.host) && this.host[0] === '/';
  }
}

export default Scanner;
