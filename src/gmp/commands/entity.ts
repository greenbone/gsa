/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import HttpCommand, {
  BULK_SELECT_BY_IDS,
  type HttpCommandGetParams,
  type HttpCommandInputParams,
  type HttpCommandOptions,
  type HttpCommandParamsOptions,
  type HttpCommandPostParams,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import {type XmlMeta, type XmlResponseData} from 'gmp/http/transform/fast-xml';
import logger from 'gmp/log';
import ActionResult from 'gmp/models/action-result';
import type Filter from 'gmp/models/filter';
import type Model from 'gmp/models/model';
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

export type EntityActionResponse = Response<EntityActionData, XmlMeta>;

const log = logger.getLogger('gmp.commands.entity');

abstract class EntityCommand<
  TModel extends Model,
  TElement = XmlResponseData,
  TRoot extends XmlResponseData = XmlResponseData,
> extends HttpCommand {
  private readonly clazz: ModelClass<Model>;
  private readonly id_name: string;
  readonly name: string;

  constructor(http: Http, name: string, clazz: ModelClass<Model>) {
    super(http, {cmd: 'get_' + name});

    this.clazz = clazz;
    this.name = name;
    this.id_name = name + '_id';

    this.transformResponseToModel = this.transformResponseToModel.bind(this);
  }

  protected abstract getElementFromRoot(root: TRoot): TElement;

  protected postParams(
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

  protected getParams(
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

  protected getModelFromResponse(response: Response<TRoot, XmlMeta>): TModel {
    return this.clazz.fromElement(
      this.getElementFromRoot(response.data),
    ) as TModel;
  }

  protected transformResponseToModel(
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

  protected transformActionResult(
    response: Response<XmlResponseData, XmlMeta>,
  ): Response<ActionResult, XmlMeta> {
    return response.setData(new ActionResult(response.data));
  }

  /**
   * Creates a HTTP POST Request returning an ActionResult
   *
   * @returns A Promise returning a Response with an ActionResult model as data
   */
  protected async action(
    params: HttpCommandPostParams,
    options?: HttpCommandOptions,
  ) {
    const response = await this.httpPostWithTransform(params, options);
    return this.transformActionResult(response);
  }

  /**
   * Creates a HTTP POST Request returning EntityActionData
   *
   * @returns A Promise returning a Response with EntityActionData as data
   */
  protected async entityAction(
    params: HttpCommandPostParams,
    options?: HttpCommandOptions,
  ) {
    const response = await this.action(params, options);
    return response.setData<EntityActionData>({id: response.data.id});
  }

  async get(
    {id}: EntityCommandParams,
    {filter, ...options}: EntityCommandGetParams = {},
  ) {
    const response = await this.httpGetWithTransform({id, filter}, options);
    return this.transformResponseToModel(response as Response<TRoot, XmlMeta>);
  }

  async clone({id}: EntityCommandParams) {
    const extraParams = {
      id, // we need plain 'id' in the submitted form data not 'xyz_id'
    };
    try {
      const response = await this.entityAction(
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

  async delete({id}: EntityCommandParams) {
    log.debug('Deleting', this.name, id);

    await this.httpPostWithTransform({
      cmd: 'delete_' + this.name,
      id,
    });
  }

  async export({id}: EntityCommandParams) {
    return this.httpRequestWithRejectionTransform('post', {
      data: this.postParams({
        cmd: 'bulk_export',
        resource_type: this.name,
        bulk_select: BULK_SELECT_BY_IDS,
        ['bulk_selected:' + id]: 1,
      }),
    });
  }
}

export default EntityCommand;
