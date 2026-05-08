/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import Filter, {type FilterModelElement} from 'gmp/models/filter';
import {resourceType, type EntityType} from 'gmp/utils/entity-type';

interface GetFilterResponseData extends XmlResponseData {
  get_filter?: {
    get_filters_response?: {
      filter?: FilterModelElement;
    };
  };
}

const log = logger.getLogger('gmp.commands.filters');

export class FilterCommand extends EntityCommand<Filter, FilterModelElement> {
  constructor(http: Http) {
    super(http, 'filter', Filter);
  }

  create(args: {
    term: string;
    name: string;
    type: EntityType;
    comment?: string;
  }) {
    const {term, name, type, comment = ''} = args;
    const data = {
      cmd: 'create_filter',
      term,
      name,
      resource_type: resourceType(type),
      comment,
    };
    log.debug('Creating new filter', args, data);
    return this.action(data);
  }

  save(args: {
    id: string;
    term: string;
    name: string;
    type: EntityType;
    comment?: string;
  }) {
    const {id, term, name, type, comment = ''} = args;
    const data = {
      cmd: 'save_filter',
      comment,
      id,
      name,
      resource_type: resourceType(type),
      term,
    };
    log.debug('Saving filter', args, data);
    return this.action(data);
  }

  getElementFromRoot(root: XmlResponseData): FilterModelElement {
    return (
      (root as GetFilterResponseData).get_filter?.get_filters_response
        ?.filter ?? ({} as FilterModelElement)
    );
  }
}

export default FilterCommand;
