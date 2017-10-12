/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {get_handler} from '../../entity/withEntityComponent.js';

import TaskComponent from './component.js';

const DEFAULT_MAPPING = {
  clone: 'onTaskCloneClick',
  onCloned: 'onCloned',
  onCloneError: 'onError',
  create: 'onTaskCreateClick',
  onCreated: 'onCreated',
  onCreateError: undefined, // let dialog handle error via returned promise
  delete: 'onTaskDeleteClick',
  onDeleted: 'onDeleted',
  onDeleteError: 'onError',
  save: 'onTaskSaveClick',
  onSaved: 'onSaved',
  onSaveError: undefined, // same as onCreateError
  download: 'onTaskDownloadClick',
  onDownloaded: 'onDownloaded',
  onDownloadeError: 'onError',
  edit: 'onTaskEditClick',
  reportimport: 'onReportImportClick',
  onReportImported: 'onReportImported',
  onReportImportError: undefined,
  createcontainer: 'onContainerTaskCreateClick',
  onContainerCreated: 'onContainerCreated',
  onContainerCreateError: undefined,
  onContainerSaved: 'onContainerSaved',
  onContainerSaveError: undefined,
  resume: 'onTaskResumeClick',
  onResumed: 'onResumed',
  onResumeError: 'onError',
  start: 'onTaskStartClick',
  onStarted: 'onStarted',
  onStartError: 'onError',
  stop: 'onTaskStopClick',
  onStopped: 'onStopped',
  onStopError: 'onError',
  advancedtaskwizard: 'onAdvancedTaskWizardClick',
  onAdvancedTaskWizardSaved: 'onAdvancedTaskWizardSaved',
  onAdvancedTaskWizardError: undefined,
  modifytaskwizard: 'onModifyTaskWizardClick',
  onModifyTaskWizardSaved: 'onModifyTaskWizardSaved',
  onModifyTaskWizardError: undefined,
  taskwizard: 'onTaskWizardClick',
  onTaskWizardSaved: 'onTaskWizardSaved',
  onTaskWizardError: undefined,
};

const withTaskComponent = (mapping = {}) => Component => {

  mapping = {
    ...DEFAULT_MAPPING,
    ...mapping,
  };

  const TaskComponentWrapper = props => {
    const {
      create: create_name,
      createcontainer: createcontainer_name,
      clone: clone_name,
      delete: delete_name,
      download: download_name,
      edit: edit_name,
      save: save_name,
      start: start_name,
      stop: stop_name,
      resume: resume_name,
      reportimport: reportimport_name,
      advancedtaskwizard: advancedtaskwizard_name,
      modifytaskwizard: modifytaskwizard_name,
      taskwizard: taskwizard_name,
      onAdvancedTaskWizardError,
      onAdvancedTaskWizardSaved,
      onCloneError,
      onCloned,
      onContainerCreateError,
      onContainerCreated,
      onContainerSaveError,
      onContainerSaved,
      onCreateError,
      onCreated,
      onDeleteError,
      onDeleted,
      onDownloadError,
      onDownloaded,
      onModifyTaskWizardError,
      onModifyTaskWizardSaved,
      onReportImportError,
      onReportImported,
      onResumeError,
      onResumed,
      onSaveError,
      onSaved,
      onStartError,
      onStarted,
      onStopError,
      onStopped,
      onTaskWizardError,
      onTaskWizardSaved,
    } = mapping;
    return (
      <TaskComponent
        onAdvancedTaskWizardError={
          get_handler(props, onAdvancedTaskWizardError)}
        onAdvancedTaskWizardSaved={
          get_handler(props, onAdvancedTaskWizardSaved)}
        onCloneError={get_handler(props, onCloneError)}
        onCloned={get_handler(props, onCloned)}
        onContainerCreateError={get_handler(props, onContainerCreateError)}
        onContainerCreated={get_handler(props, onContainerCreated)}
        onContainerSaveError={get_handler(props, onContainerSaveError)}
        onContainerSaved={get_handler(props, onContainerSaved)}
        onCreateError={get_handler(props, onCreateError)}
        onCreated={get_handler(props, onCreated)}
        onDeleteError={get_handler(props, onDeleteError)}
        onDeleted={get_handler(props, onDeleted)}
        onDownloadError={get_handler(props, onDownloadError)}
        onDownloaded={get_handler(props, onDownloaded)}
        onModifyTaskWizardError={get_handler(props, onModifyTaskWizardError)}
        onModifyTaskWizardSaved={get_handler(props, onModifyTaskWizardSaved)}
        onReportImportError={get_handler(props, onReportImportError)}
        onReportImported={get_handler(props, onReportImported)}
        onResumeError={get_handler(props, onResumeError)}
        onResumed={get_handler(props, onResumed)}
        onSaveError={get_handler(props, onSaveError)}
        onSaved={get_handler(props, onSaved)}
        onStartError={get_handler(props, onStartError)}
        onStarted={get_handler(props, onStarted)}
        onStopError={get_handler(props, onStopError)}
        onStopped={get_handler(props, onStopped)}
        onTaskWizardError={get_handler(props, onTaskWizardError)}
        onTaskWizardSaved={get_handler(props, onTaskWizardSaved)}
      >
        {({
          advancedtaskwizard,
          clone,
          create,
          createcontainer,
          delete: delete_func,
          download,
          edit,
          modifytaskwizard,
          reportimport,
          resume,
          save,
          start,
          stop,
          taskwizard,
        }) => {
          const cprops = {
            [advancedtaskwizard_name]: advancedtaskwizard,
            [clone_name]: clone,
            [create_name]: create,
            [createcontainer_name]: createcontainer,
            [delete_name]: delete_func,
            [download_name]: download,
            [edit_name]: edit,
            [modifytaskwizard_name]: modifytaskwizard,
            [reportimport_name]: reportimport,
            [resume_name]: resume,
            [save_name]: save,
            [start_name]: start,
            [stop_name]: stop,
            [taskwizard_name]: taskwizard,
          };
          return (
            <Component {...props} {...cprops} />
          );
        }}
      </TaskComponent>
    );
  };
  return TaskComponentWrapper;
};

export default withTaskComponent;

// vim: set ts=2 sw=2 tw=80:
