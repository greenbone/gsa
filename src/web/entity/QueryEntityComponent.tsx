/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';

interface QueryMutation<TVariables, TResponse> {
  mutateAsync: (variables: TVariables) => Promise<TResponse>;
}

interface QueryEntityComponentRenderProps<
  TEntity,
  TCreateData,
  TCreateResponse,
  TSaveData,
  TSaveResponse,
> {
  delete: (entity: TEntity) => Promise<void>;
  create: (data: TCreateData) => Promise<TCreateResponse>;
  clone: (entity: TEntity) => Promise<void>;
  download: (entity: TEntity) => Promise<void>;
  save: (entity: TSaveData) => Promise<TSaveResponse>;
}

interface QueryEntityComponentProps<
  TEntity,
  TCreateData,
  TCreateVariables,
  TCreateResponse,
  TSaveData,
  TSaveVariables,
  TSaveResponse,
  TDeleteVariables,
  TCloneVariables,
> {
  entityName?: string;
  children: (
    props: QueryEntityComponentRenderProps<
      TEntity,
      TCreateData,
      TCreateResponse,
      TSaveData,
      TSaveResponse
    >,
  ) => React.ReactNode;
  createMutation: QueryMutation<TCreateVariables, TCreateResponse>;
  saveMutation: QueryMutation<TSaveVariables, TSaveResponse>;
  deleteMutation: QueryMutation<TDeleteVariables, unknown>;
  cloneMutation: QueryMutation<TCloneVariables, unknown>;
  downloadById: (id: string, entity: TEntity) => Promise<void>;
  getEntityId?: (entity: TEntity) => string | undefined;
  getSaveId?: (data: TSaveData) => string | undefined;
  mapCreateVariables: (data: TCreateData) => TCreateVariables;
  mapSaveVariables: (data: TSaveData, id: string) => TSaveVariables;
  mapDeleteVariables?: (id: string, entity: TEntity) => TDeleteVariables;
  mapCloneVariables?: (id: string, entity: TEntity) => TCloneVariables;
}

const QueryEntityComponent = <
  TEntity,
  TCreateData,
  TCreateVariables,
  TCreateResponse,
  TSaveData,
  TSaveVariables,
  TSaveResponse,
  TDeleteVariables,
  TCloneVariables,
>({
  entityName = 'Entity',
  children,
  createMutation,
  saveMutation,
  deleteMutation,
  cloneMutation,
  downloadById,
  getEntityId,
  getSaveId,
  mapCreateVariables,
  mapSaveVariables,
  mapDeleteVariables,
  mapCloneVariables,
}: QueryEntityComponentProps<
  TEntity,
  TCreateData,
  TCreateVariables,
  TCreateResponse,
  TSaveData,
  TSaveVariables,
  TSaveResponse,
  TDeleteVariables,
  TCloneVariables
>) => {
  const requireEntityId = (entity: TEntity, operation: string): string => {
    const id = getEntityId ? getEntityId(entity) : (entity as {id?: string}).id;
    if (!isDefined(id)) {
      throw new Error(`${entityName} ID is required for ${operation}`);
    }
    return id;
  };

  const requireSaveId = (data: TSaveData): string => {
    const id = getSaveId ? getSaveId(data) : (data as {id?: string}).id;
    if (!isDefined(id)) {
      throw new Error(`${entityName} ID is required for saving`);
    }
    return id;
  };

  return children({
    create: data => createMutation.mutateAsync(mapCreateVariables(data)),
    save: data =>
      saveMutation.mutateAsync(mapSaveVariables(data, requireSaveId(data))),
    delete: entity => {
      const id = requireEntityId(entity, 'deletion');
      const variables = mapDeleteVariables
        ? mapDeleteVariables(id, entity)
        : ({id} as unknown as TDeleteVariables);
      return deleteMutation.mutateAsync(variables).then(() => {});
    },
    clone: entity => {
      const id = requireEntityId(entity, 'cloning');
      const variables = mapCloneVariables
        ? mapCloneVariables(id, entity)
        : ({id} as unknown as TCloneVariables);
      return cloneMutation.mutateAsync(variables).then(() => {});
    },
    download: entity => downloadById(requireEntityId(entity, 'export'), entity),
  });
};

export default QueryEntityComponent;
