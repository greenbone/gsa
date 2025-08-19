/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GmpCommand from 'gmp/commands/gmp';
import {
  BULK_SELECT_BY_IDS,
  HttpCommandGetParams,
  HttpCommandInputParams,
  HttpCommandOptions,
  HttpCommandParamsOptions,
  HttpCommandPostParams,
} from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response, {Meta} from 'gmp/http/response';
import DefaultTransform from 'gmp/http/transform/default';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import ActionResult from 'gmp/models/actionresult';
import Filter from 'gmp/models/filter';
import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';

interface ModelClass<TModel> {
  fromElement(element: unknown): TModel;
}

interface EntityCommandInputParams extends HttpCommandInputParams {
  id?: string;
}

interface EntityCommandGetParams {
  filter?: Filter | string;
}

export interface EntityCommandParams {
  id: string;
}

export interface EntityActionData {
  id: string;
}

const log = logger.getLogger('gmp.commands.entity');

abstract class EntityCommand<
  TModel extends Model,
  TElement = XmlResponseData,
  TRoot extends XmlResponseData = XmlResponseData,
> extends GmpCommand {
  readonly clazz: ModelClass<Model>;
  readonly name: string;
  readonly id_name: string;

  constructor(http: GmpHttp, name: string, clazz: ModelClass<Model>) {
    super(http, {cmd: 'get_' + name});

    this.clazz = clazz;
    this.name = name;
    this.id_name = name + '_id';

    this.transformResponse = this.transformResponse.bind(this);
  }

  abstract getElementFromRoot(root: TRoot): TElement;

  postParams(
    params: EntityCommandInputParams = {},
    extraParams?: HttpCommandPostParams,
    options?: HttpCommandParamsOptions,
  ) {
    const {id, ...other} = params;
    const rParams = super.postParams(other, extraParams, options);

    if (isDefined(id)) {
      rParams[this.id_name] = id;
    }
    return rParams;
  }

  getParams(
    params: EntityCommandInputParams = {},
    extraParams?: HttpCommandGetParams,
    options?: HttpCommandParamsOptions,
  ): HttpCommandGetParams {
    const {id, ...other} = params;
    const rParams = super.getParams(other, extraParams, options);

    if (isDefined(id)) {
      rParams[this.id_name] = id;
    }
    return rParams;
  }

  getModelFromResponse(response: Response<TRoot, XmlMeta>): TModel {
    return this.clazz.fromElement(
      this.getElementFromRoot(response.data),
    ) as TModel;
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
      let response = await this.action(
        {
          cmd: 'clone',
          resource_type: this.name,
        },
        {
          extraParams,
        },
      );
      log.debug('Cloned', this.name, id);
      return response.setData({id: response.data.id});
    } catch (err) {
      log.error('An error occurred while cloning', this.name, id, err);
      throw err;
    }
  }

  async delete({id}: EntityCommandParams) {
    log.debug('Deleting', this.name, id);

    await this.httpPost({
      cmd: 'delete_' + this.name,
      id,
    });
  }

  async export({id}: EntityCommandParams) {
    const params = {
      cmd: 'bulk_export',
      resource_type: this.name,
      bulk_select: BULK_SELECT_BY_IDS,
      ['bulk_selected:' + id]: 1,
    };
    const response = await this.httpPost(params, {
      transform: DefaultTransform,
    } as HttpCommandOptions);
    return response as unknown as Response<string, Meta>;
  }

  transformActionResult(
    response: Response<XmlResponseData, XmlMeta>,
  ): Response<ActionResult, XmlMeta> {
    return response.setData(new ActionResult(response.data));
  }

  /**
   * Creates a HTTP POST Request returning an ActionResult
   *
   * @returns A Promise returning a Response with an ActionResult model as data
   */
  async action(params: HttpCommandPostParams, options?: HttpCommandOptions) {
    const response = await this.httpPost(params, options);
    return this.transformActionResult(response);
  }

  /**
   * Creates a HTTP POST Request returning EntityActionData
   *
   * @returns A Promise returning a Response with EntityActionData as data
   */
  async entityAction(
    params: HttpCommandPostParams,
    options?: HttpCommandOptions,
  ) {
    const response = await this.action(params, options);
    return response.setData<EntityActionData>({id: response.data.id});
  }
}

export default EntityCommand;
