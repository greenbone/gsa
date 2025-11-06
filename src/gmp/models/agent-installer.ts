/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseToString} from 'gmp/parser';
import {type EntityType} from 'gmp/utils/entity-type';

export interface AgentInstallerElement extends ModelElement {
  content_type?: string;
  description?: string;
  file_extension?: string;
  version?: string;
  checksum?: string;
}

interface AgentInstallerProperties extends ModelProperties {
  contentType?: string;
  description?: string;
  fileExtension?: string;
  version?: string;
  checksum?: string;
}

class AgentInstaller extends Model {
  readonly entityType: EntityType = 'agentinstaller';

  readonly contentType?: string;
  readonly description?: string;
  readonly fileExtension?: string;
  readonly version?: string;
  readonly checksum?: string;

  constructor({
    contentType,
    description,
    fileExtension,
    version,
    checksum,
    ...properties
  }: AgentInstallerProperties = {}) {
    super(properties);

    this.contentType = contentType;
    this.description = description;
    this.fileExtension = fileExtension;
    this.version = version;
    this.checksum = checksum;
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
    copy.description = element.description;
    copy.fileExtension = element.file_extension;
    copy.version = parseToString(element.version);
    copy.checksum = element.checksum;

    return copy;
  }
}

export default AgentInstaller;
