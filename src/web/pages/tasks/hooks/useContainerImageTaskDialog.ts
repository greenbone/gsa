/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useCallback} from 'react';
import type {EntityActionData} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import type {XmlMeta} from 'gmp/http/transform/fast-xml';
import {CONTAINER_IMAGE_TASK_SCANNER_ID} from 'gmp/models/scanner';
import type {default as Task} from 'gmp/models/task';
import {parseBoolean} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import type {ContainerImageTaskDialogData} from 'web/pages/tasks/ContainerImageTaskDialog';

interface UseContainerImageTaskDialogProps {
  onContainerCreated?: (response: Response<EntityActionData, XmlMeta>) => void;
  onContainerCreateError?: (error: Rejection) => void;
  onContainerSaved?: () => void;
  onContainerSaveError?: (error: Rejection) => void;
}

export const useContainerImageTaskDialog = ({
  onContainerCreated,
  onContainerCreateError,
  onContainerSaved,
  onContainerSaveError,
}: UseContainerImageTaskDialogProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [containerImageTaskDialogVisible, setContainerImageTaskDialogVisible] =
    useState(false);
  const [task, setTask] = useState<Task | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const [addTag, setAddTag] = useState<boolean | undefined>();
  const [alterable, setAlterable] = useState<boolean | undefined>();
  const [applyOverrides, setApplyOverrides] = useState<boolean | undefined>();
  const [inAssets, setInAssets] = useState<boolean | undefined>();
  const [schedulePeriods, setSchedulePeriods] = useState<boolean | undefined>();
  const [ociImageTargetId, setOciImageTargetId] = useState<
    string | undefined
  >();
  const [scannerId, setScannerId] = useState<string>(
    CONTAINER_IMAGE_TASK_SCANNER_ID,
  );
  const [title, setTitle] = useState<string>('');

  const openContainerImageTaskDialog = useCallback(
    (task?: Task) => {
      setContainerImageTaskDialogVisible(true);
      setTask(task);
      setName(task ? task.name : _('Unnamed'));
      setComment(task ? task.comment : '');
      setAddTag(false);
      setAlterable(task ? parseBoolean(task.alterable) : false);
      setApplyOverrides(task ? parseBoolean(task.apply_overrides) : true);
      setInAssets(task ? parseBoolean(task.in_assets) : true);
      setSchedulePeriods(task ? parseBoolean(task.schedule_periods) : false);
      setOciImageTargetId(undefined);
      setScannerId(CONTAINER_IMAGE_TASK_SCANNER_ID);
      setTitle(
        task
          ? _('Edit Container Image Task {{name}}', {
              name: task.name as string,
            })
          : _('New Container Image Task'),
      );
    },
    [_],
  );

  const closeContainerImageTaskDialog = useCallback(() => {
    setContainerImageTaskDialogVisible(false);
  }, []);

  const handleOciImageTargetChange = useCallback((value: string) => {
    setOciImageTargetId(value);
  }, []);

  const handleScannerChange = useCallback((value: string) => {
    setScannerId(value);
  }, []);

  const handleSaveContainerImageTask = useCallback(
    (data: ContainerImageTaskDialogData) => {
      const {
        id,
        comment,
        inAssets,
        name,
        ociImageTargetId,
        scannerId,
        alertIds,
        scheduleId,
        addTag,
        tagId,
        alterable,
        applyOverrides,
        autoDelete,
        autoDeleteData,
        minQod,
        schedulePeriods,
        acceptInvalidCerts,
        registryAllowInsecure,
        scannerType,
      } = data;

      if (isDefined(id)) {
        return gmp.task
          .saveContainerImageTask({
            id,
            comment,
            inAssets,
            name,
            ociImageTargetId,
            scannerId,
            alertIds,
            scheduleId,
            alterable,
            applyOverrides,
            autoDelete,
            autoDeleteData,
            minQod,
            schedulePeriods,
            acceptInvalidCerts,
            registryAllowInsecure,
            scannerType,
          })
          .then(onContainerSaved, onContainerSaveError)
          .then(() => closeContainerImageTaskDialog());
      }

      return gmp.task
        .createContainerImageTask({
          comment,
          name,
          ociImageTargetId,
          scannerId,
          alertIds,
          scheduleId,
          addTag,
          tagId,
          alterable,
          applyOverrides,
          autoDelete,
          autoDeleteData,
          inAssets,
          minQod,
          schedulePeriods,
          acceptInvalidCerts,
          registryAllowInsecure,
          scannerType,
        })
        .then(onContainerCreated, onContainerCreateError)
        .then(() => closeContainerImageTaskDialog());
    },
    [
      gmp,
      onContainerCreated,
      onContainerCreateError,
      onContainerSaved,
      onContainerSaveError,
      closeContainerImageTaskDialog,
    ],
  );

  return {
    // State
    containerImageTaskDialogVisible,
    task,
    name,
    comment,
    addTag,
    alterable,
    applyOverrides,
    inAssets,
    schedulePeriods,
    ociImageTargetId,
    scannerId,
    title,

    // Actions
    openContainerImageTaskDialog,
    closeContainerImageTaskDialog,
    handleSaveContainerImageTask,
    handleOciImageTargetChange,
    handleScannerChange,
  };
};
