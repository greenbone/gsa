/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {RESET_FILTER, TASKS_FILTER_FILTER} from 'gmp/models/filter';
import {NewIcon, AuditIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import AuditComponent from 'web/pages/audits/AuditComponent';
import Table from 'web/pages/audits/Table';
import {taskReloadInterval} from 'web/pages/tasks/TaskListPage';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/audits';
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = ({onAuditCreateClick}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="configuring-and-managing-audits"
        page="compliance-and-special-scans"
        title={_('Help: Audits')}
      />
      {capabilities.mayCreate('task') && (
        <NewIcon title={_('New Audit')} onClick={onAuditCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onAuditCreateClick: PropTypes.func.isRequired,
};

const Page = ({onChanged, onDownloaded, onError, ...props}) => {
  const [_] = useTranslation();

  return (
    <AuditComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onResumeError={onError}
      onResumed={onChanged}
      onSaved={onChanged}
      onStartError={onError}
      onStarted={onChanged}
      onStopError={onError}
      onStopped={onChanged}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        edit,
        start,
        stop,
        resume,
        reportDownload,
        gcrFormatDefined,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Audits')} />
          <EntitiesPage
            {...props}
            filtersFilter={TASKS_FILTER_FILTER}
            gcrFormatDefined={gcrFormatDefined}
            sectionIcon={<AuditIcon size="large" />}
            table={Table}
            title={_('Audits')}
            toolBarIcons={ToolBarIcons}
            onAuditCloneClick={clone}
            onAuditCreateClick={create}
            onAuditDeleteClick={deleteFunc}
            onAuditDownloadClick={download}
            onAuditEditClick={edit}
            onAuditResumeClick={resume}
            onAuditStartClick={start}
            onAuditStopClick={stop}
            onError={onError}
            onReportDownloadClick={reportDownload}
          />
        </React.Fragment>
      )}
    </AuditComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('audit', {
  entitiesSelector,
  loadEntities,
  defaultFilter: RESET_FILTER,
  reloadInterval: taskReloadInterval,
})(Page);
