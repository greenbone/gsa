/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {Date as GmpDate} from 'gmp/models/date';
import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseDate, parseInt, parseToString} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {type EntityType} from 'gmp/utils/entitytype';

// Possible values for file_validity are 'valid' or a string describing why the file is not valid
type FileValidity = 'valid' | string;

interface CpeElement {
  criteria: string;
  version_start_incl?: string;
  version_start_excl?: string;
  version_end_incl?: string;
  version_end_excl?: string;
}

export interface AgentInstallerElement extends ModelElement {
  content_type?: string;
  file_extension?: string;
  version?: string;
  checksum?: string;
  file_size?: number;
  file_validity?: string;
  last_update?: string;
  cpes?: CpeElement | CpeElement[];
}

interface Cpe {
  criteria: string;
  versionStartIncluding?: string;
  versionStartExcluding?: string;
  versionEndIncluding?: string;
  versionEndExcluding?: string;
}

interface AgentInstallerProperties extends ModelProperties {
  contentType?: string;
  fileExtension?: string;
  version?: string;
  checksum?: string;
  fileSize?: number;
  fileValidity?: FileValidity;
  lastUpdate?: GmpDate;
  cpes?: Cpe[];
}

class AgentInstaller extends Model {
  readonly entityType: EntityType = 'agentinstaller';

  readonly contentType?: string;
  readonly fileExtension?: string;
  readonly version?: string;
  readonly checksum?: string;
  readonly fileSize?: number;
  readonly fileValidity?: FileValidity;
  readonly lastUpdate?: GmpDate;
  readonly cpes: Cpe[];

  constructor({
    contentType,
    fileExtension,
    version,
    checksum,
    fileSize,
    fileValidity,
    lastUpdate,
    cpes = [],
    ...properties
  }: AgentInstallerProperties = {}) {
    super(properties);

    this.contentType = contentType;
    this.fileExtension = fileExtension;
    this.version = version;
    this.checksum = checksum;
    this.fileSize = fileSize;
    this.fileValidity = fileValidity;
    this.lastUpdate = lastUpdate;
    this.cpes = cpes;
  }

  static fromElement(element: AgentInstallerElement = {}): AgentInstaller {
    const props = this.parseElement(element);
    return new AgentInstaller(props);
  }

  static parseElement(
    element: AgentInstallerElement = {},
  ): AgentInstallerProperties {
    const copy = super.parseElement(element) as AgentInstallerProperties;

    copy.contentType = element.content_type;
    copy.fileExtension = element.file_extension;
    copy.version = parseToString(element.version);
    copy.checksum = element.checksum;
    copy.fileSize = parseInt(element.file_size);
    copy.fileValidity = element.file_validity;
    copy.lastUpdate = parseDate(element.last_update);
    copy.cpes = map(element.cpes, cpe => {
      return {
        criteria: cpe.criteria,
        versionStartIncluding: cpe.version_start_incl,
        versionStartExcluding: cpe.version_start_excl,
        versionEndIncluding: cpe.version_end_incl,
        versionEndExcluding: cpe.version_end_excl,
      };
    });
    return copy;
  }
}

export default AgentInstaller;
