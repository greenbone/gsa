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

export type Element = Record<string, unknown>;

export type ModelElement = EntityModelElement;
export type ModelProperties = EntityModelProperties;

/**
 * A model representing an entity with a required ID
 */
class Model extends EntityModel {
  constructor(entityType?: string) {
    super({}, entityType);
  }
  }

  static fromElement(element: ModelElement = {}, entityType?: string): Model {
    const f = new this(entityType);
    setProperties(this.parseElement(element), f);
    return f;
  }

  static parseElement(element: ModelElement = {}): ModelProperties {
    return parseEntityModelProperties(element);
  }
}

export const parseModelFromElement = (
  element: ModelElement,
  entityType: string,
) => {
  return Model.fromElement(element as Element, entityType);
};

export default Model;
