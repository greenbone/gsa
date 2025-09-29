/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityModel, {
  EntityModelElement,
  EntityModelProperties,
  parseEntityModelProperties,
} from 'gmp/models/entitymodel';
import {setProperties} from 'gmp/parser';
import {EntityType} from 'gmp/utils/entitytype';

export type Element = Record<string, unknown>;

export type ModelElement = EntityModelElement;
export type ModelProperties = EntityModelProperties;

/**
 * A model representing an entity with a required ID
 */
class Model extends EntityModel {
  constructor(properties: ModelProperties = {}, entityType?: EntityType) {
    super(properties, entityType);
  }

  static fromElement(
    element: ModelElement = {},
    entityType?: EntityType,
  ): Model {
    const {
      id,
      creationTime,
      modificationTime,
      _type,
      active,
      comment,
      endTime,
      inUse,
      name,
      orphan,
      owner,
      summary,
      timestamp,
      trash,
      userCapabilities,
      userTags,
      writable,
      ...other
    } = this.parseElement(element);
    const f = new this(
      {
        id,
        creationTime,
        modificationTime,
        _type,
        active,
        comment,
        endTime,
        inUse,
        name,
        orphan,
        owner,
        summary,
        timestamp,
        trash,
        userCapabilities,
        userTags,
        writable,
      },
      entityType,
    );
    // Set additional properties from the element for now
    // This should be removed when all code is migrated to TypeScript
    // and the actual used properties are defined in the corresponding classes
    setProperties(other, f);
    return f;
  }

  static parseElement(element: ModelElement = {}): ModelProperties {
    return parseEntityModelProperties(element);
  }
}

export const parseModelFromElement = (
  element: ModelElement,
  entityType: EntityType,
) => {
  return Model.fromElement(element as Element, entityType);
};

export default Model;
