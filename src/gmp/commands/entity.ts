/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GmpCommand, {
  BULK_SELECT_BY_IDS,
  GmpCommandInputParams,
} from 'gmp/commands/gmp';
import {HttpCommandOptions, HttpCommandParamsOptions} from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response from 'gmp/http/response';
import DefaultTransform from 'gmp/http/transform/default';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import {UrlParams as Params} from 'gmp/http/utils';
import logger from 'gmp/log';
import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

const log = logger.getLogger('gmp.commands.entity');

interface ModelClass<TModel> {
  fromElement(element: unknown): TModel;
}

interface EntityCommandInputParams extends GmpCommandInputParams {
  id?: string;
}

interface EntityCommandGetParams {
  filter?: string;
}

export interface EntityCommandParams {
  id: string;
}

abstract class EntityCommand<
  TModel extends Model,
  TElement = XmlResponseData,
  TRoot extends XmlResponseData = XmlResponseData,
> extends GmpCommand {
  clazz: ModelClass<TModel>;
  name: string;
  id_name: string;

  constructor(http: GmpHttp, name: string, clazz: ModelClass<TModel>) {
    super(http, {cmd: 'get_' + name});

    this.clazz = clazz;
    this.name = name;
    this.id_name = name + '_id';

    this.transformResponse = this.transformResponse.bind(this);
  }

  abstract getElementFromRoot(root: TRoot): TElement;

  getParams(
    params: EntityCommandInputParams,
    extraParams?: Params,
    options?: HttpCommandParamsOptions,
  ) {
    const {id, ...other} = params;
    const rParams = super.getParams(other, extraParams, options);

    if (isDefined(id)) {
      rParams[this.id_name] = id;
    }
    return rParams;
  }

  getModelFromResponse(response: Response<TRoot, XmlMeta>): TModel {
    return this.clazz.fromElement(this.getElementFromRoot(response.data));
  }

  transformResponse(
    response: Response<TRoot, XmlMeta>,
  ): Response<TModel, XmlMeta> {
    let entity = this.getModelFromResponse(response);
    if (!isDefined(entity.id)) {
      log.warn('Entity with undefined id found.'); // FIXME gsad MUST return 404 if no entity has been found
      // @ts-ignore
      entity = undefined;
    }
    return response.setData(entity);
  }

  async get(
    {id}: EntityCommandParams,
    {filter, ...options}: EntityCommandGetParams = {},
  ) {
    const response = await this.httpGet({id, filter}, options);
    return this.transformResponse(response as Response<TRoot, XmlMeta>);
  }

  async clone({id}: EntityCommandParams) {
    const extraParams = {
      id, // we need plain 'id' in the submitted form data not 'xyz_id'
    };
    try {
      const response = await this.action(
        {
          cmd: 'clone',
          resource_type: this.name,
        },
        {
          extraParams,
        },
      );
      log.debug('Cloned', this.name, id);
      return response;
    } catch (err) {
      log.error('An error occurred while cloning', this.name, id, err);
      throw err;
    }
  }

  delete({id}: EntityCommandParams) {
    log.debug('Deleting', this.name, id);

    const params = {
      cmd: 'delete_' + this.name,
      id,
    };
    return this.httpPost(params);
  }

  export({id}: EntityCommandParams) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_IDS,
      ['bulk_selected:' + id]: 1,
    };
    return this.httpPost(params, {
      transform: DefaultTransform,
    } as HttpCommandOptions);
  }
}

export default EntityCommand;
