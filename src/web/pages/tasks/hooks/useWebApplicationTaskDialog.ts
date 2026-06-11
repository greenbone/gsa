/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useCallback} from 'react';
import {WEB_APPLICATION_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import type {default as Task} from 'gmp/models/task';
import {parseBoolean} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {type EntityCreateResponse} from 'web/entity/hooks/useEntityCreate';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import type {WebApplicationTaskDialogData} from 'web/pages/tasks/WebApplicationTaskDialog';

interface UseWebApplicationTaskDialogProps {
  onWebAppCreated?: (response: EntityCreateResponse) => void;
  onWebAppCreateError?: (error: Error) => void;
  onWebAppSaved?: () => void;
  onWebAppSaveError?: (error: Error) => void;
}

export const useWebApplicationTaskDialog = ({
  onWebAppCreated,
  onWebAppCreateError,
  onWebAppSaved,
  onWebAppSaveError,
}: UseWebApplicationTaskDialogProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const [webApplicationTaskDialogVisible, setWebApplicationTaskDialogVisible] =
    useState(false);
  const [task, setTask] = useState<Task | undefined>();
  const [name, setName] = useState<string | undefined>();
  const [comment, setComment] = useState<string | undefined>();
  const [addTag, setAddTag] = useState<boolean | undefined>();
  const [alterable, setAlterable] = useState<boolean | undefined>();
  const [applyOverrides, setApplyOverrides] = useState<boolean | undefined>();
  const [inAssets, setInAssets] = useState<boolean | undefined>();
  const [schedulePeriods, setSchedulePeriods] = useState<boolean | undefined>();
  const [scheduleId, setScheduleId] = useState<string | undefined>();
  const [webApplicationTargetId, setWebApplicationTargetId] = useState<
    string | undefined
  >();

  const [scannerId, setScannerId] = useState<string>(
    WEB_APPLICATION_DEFAULT_SCANNER_ID,
  );
  const [title, setTitle] = useState<string>('');

  const openWebApplicationTaskDialog = useCallback(
    (task?: Task) => {
      setWebApplicationTaskDialogVisible(true);
      setTask(task);
      setName(task ? task.name : _('Unnamed'));
      setComment(task ? task.comment : '');
      setAddTag(false);
      setAlterable(task ? parseBoolean(task.alterable) : false);
      setApplyOverrides(task ? parseBoolean(task.apply_overrides) : true);
      setInAssets(task ? parseBoolean(task.in_assets) : true);
      setSchedulePeriods(task ? parseBoolean(task.schedule_periods) : false);
      setScheduleId(task?.schedule?.id);
      setWebApplicationTargetId(task?.webApplicationTarget?.id);
      setScannerId(WEB_APPLICATION_DEFAULT_SCANNER_ID);
      setTitle(
        task
          ? _('Edit Web Application Task {{- name}}', {
              name: task.name as string,
            })
          : _('New Web Application Task'),
      );
    },
    [_],
  );

  const closeWebApplicationTaskDialog = useCallback(() => {
    setWebApplicationTaskDialogVisible(false);
  }, []);

  const handleWebApplicationTargetChange = useCallback((value: string) => {
    setWebApplicationTargetId(value);
  }, []);

  const handleScannerChange = useCallback((value: string) => {
    setScannerId(value);
  }, []);

  const handleScheduleChange = useCallback((value: string) => {
    setScheduleId(value);
  }, []);

  const handleSaveWebApplicationTask = useCallback(
    (data: WebApplicationTaskDialogData) => {
      const {
        id,
        comment,
        inAssets,
        name,
        webApplicationTargetId,
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
      } = data;

      if (isDefined(id)) {
        return gmp.task
          .saveWebApplicationTask({
            id,
            comment,
            inAssets,
            name,
            webApplicationTargetId,
            scannerId,
            alertIds,
            scheduleId,
            alterable,
            applyOverrides,
            autoDelete,
            autoDeleteData,
            minQod,
            schedulePeriods,
          })
          .then(onWebAppSaved, onWebAppSaveError)
          .then(() => closeWebApplicationTaskDialog());
      }

      return gmp.task
        .createWebApplicationTask({
          comment,
          name,
          webApplicationTargetId,
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
        })
        .then(onWebAppCreated, onWebAppCreateError)
        .then(() => closeWebApplicationTaskDialog());
    },
    [
      gmp,
      onWebAppCreated,
      onWebAppCreateError,
      onWebAppSaved,
      onWebAppSaveError,
      closeWebApplicationTaskDialog,
    ],
  );

  return {
    // State
    webApplicationTaskDialogVisible,
    task,
    name,
    comment,
    addTag,
    alterable,
    applyOverrides,
    inAssets,
    schedulePeriods,
    scheduleId,
    webApplicationTargetId,
    scannerId,
    title,

    // Setters
    setWebApplicationTargetId,

    // Actions
    openWebApplicationTaskDialog,
    closeWebApplicationTaskDialog,
    handleSaveWebApplicationTask,
    handleWebApplicationTargetChange,
    handleScannerChange: handleScannerChange,
    handleScheduleChange: handleScheduleChange,
  };
};
