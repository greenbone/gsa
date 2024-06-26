/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {RESET_FILTER, TASKS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/audits';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import NewIcon from 'web/components/icon/newicon';
import ManualIcon from 'web/components/icon/manualicon';

import AuditComponent from './component';
import Table from './table';

import AuditIcon from 'web/components/icon/auditicon';
import {taskReloadInterval} from '../tasks/listpage';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onAuditCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="compliance-and-special-scans"
        anchor="configuring-and-managing-audits"
        title={_('Help: Audits')}
      />
      {capabilities.mayCreate('task') && (
        <NewIcon title={_('New Audit')} onClick={onAuditCreateClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onAuditCreateClick: PropTypes.func.isRequired,
};

const Page = ({onInteraction, onChanged, onDownloaded, onError, ...props}) => (
  <AuditComponent
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
    onResumed={onChanged}
    onResumeError={onError}
    onSaved={onChanged}
    onStarted={onChanged}
    onStartError={onError}
    onStopped={onChanged}
    onStopError={onError}
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
          onError={onError}
          onInteraction={onInteraction}
          onReportDownloadClick={reportDownload}
          onAuditCloneClick={clone}
          onAuditCreateClick={create}
          onAuditDeleteClick={deleteFunc}
          onAuditDownloadClick={download}
          onAuditEditClick={edit}
          onAuditResumeClick={resume}
          onAuditStartClick={start}
          onAuditStopClick={stop}
        />
      </React.Fragment>
    )}
  </AuditComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('audit', {
  entitiesSelector,
  loadEntities,
  defaultFilter: RESET_FILTER,
  reloadInterval: taskReloadInterval,
})(Page);

// vim: set ts=2 sw=2 tw=80:
