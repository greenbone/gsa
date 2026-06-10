/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionResponse} from 'gmp/commands/entity';
import {
  type WebApplicationTargetCreateParams,
  type WebApplicationTargetSaveParams,
} from 'gmp/commands/web-application-target';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import type Filter from 'gmp/models/filter';
import {isFilter} from 'gmp/models/filter/utils';
import type WebApplicationTarget from 'gmp/models/web-application-target';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';
import useMoveToTrashCan from 'web/queries/useMoveToTrashCan';
import useSaveMutation from 'web/queries/useSaveMutation';

type WebApplicationTargetBulkInput = WebApplicationTarget[] | Filter;

interface UseCreateWebApplicationTargetParams {
  onSuccess?: (data: EntityActionResponse) => void;
  onError?: (error: Error) => void;
}

interface UseModifyWebApplicationTargetParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGetWebApplicationTargets = ({filter}: {filter?: Filter}) => {
  const gmp = useGmp();

  return useGetEntities<WebApplicationTarget>({
    queryId: 'get_web_application_targets',
    filter,
    gmpMethod: gmp.webapplicationtargets.get.bind(gmp.webapplicationtargets),
  });
};

export const useCreateWebApplicationTarget = ({
  onSuccess,
  onError,
}: UseCreateWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useCreateMutation<
    WebApplicationTargetCreateParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.webapplicationtarget.create.bind(gmp.webapplicationtarget),
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onError,
    onSuccess,
  });
};

export const useSaveWebApplicationTarget = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useSaveMutation<
    WebApplicationTargetSaveParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.webapplicationtarget.save.bind(gmp.webapplicationtarget),
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onError,
    onSuccess,
  });
};

export const useDeleteWebApplicationTarget = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useMoveToTrashCan({
    gmpMethod: gmp.webapplicationtarget.delete.bind(gmp.webapplicationtarget),
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onSuccess,
    onError,
  });
};

export const useCloneWebApplicationTarget = ({
  onError,
  onSuccess,
}: UseCreateWebApplicationTargetParams) => {
  const gmp = useGmp();

  return useCloneMutation<EntityActionResponse, Rejection>({
    gmpMethod: gmp.webapplicationtarget.clone.bind(gmp.webapplicationtarget),
    entityType: 'webapplicationtarget',
    invalidateQueryIds: ['get_web_application_targets'],
    onError,
    onSuccess,
  });
};

export const useBulkDeleteWebApplicationTargets = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<
    WebApplicationTargetBulkInput,
    Response<WebApplicationTarget[], XmlMeta>,
    Rejection
  >({
    gmpMethod: (input: WebApplicationTargetBulkInput) => {
      return isFilter(input)
        ? gmp.webapplicationtargets.deleteByFilter(input)
        : gmp.webapplicationtargets.delete(input);
    },
    invalidateQueryIds: ['get_web_application_targets'],
    successMessage: _('Web Application Targets successfully deleted'),
    onSuccess,
    onError,
  });
};

export const useBulkExportWebApplicationTargets = ({
  onError,
  onSuccess,
}: UseModifyWebApplicationTargetParams) => {
  const gmp = useGmp();
  return useGmpMutation<
    WebApplicationTargetBulkInput,
    Response<string>,
    Rejection
  >({
    gmpMethod: (input: WebApplicationTargetBulkInput) => {
      return isFilter(input)
        ? gmp.webapplicationtargets.exportByFilter(input)
        : gmp.webapplicationtargets.export(input);
    },
    onSuccess,
    onError,
  });
};
