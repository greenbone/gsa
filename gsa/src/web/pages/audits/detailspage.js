/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

import {hasValue} from 'gmp/utils/identity';

import Badge from 'web/components/badge/badge';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import AlterableIcon from 'web/components/icon/alterableicon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import ReportIcon from 'web/components/icon/reporticon';
import ResultIcon from 'web/components/icon/resulticon';
import AuditIcon from 'web/components/icon/auditicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityPage, {Col} from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import useExportEntity from 'web/entity/useExportEntity';

import {
  useCloneAudit,
  useDeleteAudit,
  useExportAuditsByIds,
  useGetAudit,
} from 'web/graphql/audits';
import {useGetPermissions} from 'web/graphql/permissions';

import {TaskPermissions as AuditPermissions} from 'web/pages/tasks/detailspage';
import ResumeIcon from 'web/pages/tasks/icons/resumeicon';
import ScheduleIcon from 'web/pages/tasks/icons/scheduleicon';
import StartIcon from 'web/pages/tasks/icons/starticon';
import StopIcon from 'web/pages/tasks/icons/stopicon';
import AuditStatus from 'web/pages/tasks/status';

import {goto_entity_details} from 'web/utils/graphql';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import AuditDetails from './details';
import AuditComponent from './component';

export const ToolBarIcons = ({
  entity,
  links,
  onAuditDeleteClick,
  onAuditCloneClick,
  onAuditDownloadClick,
  onAuditEditClick,
  onAuditStartClick,
  onAuditStopClick,
  onAuditResumeClick,
}) => {
  const reportsCounts = entity.reports.counts;
  const currentResults = entity.results?.counts?.current;
  const {lastReport, currentReport} = entity.reports;
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          page="compliance-and-special-scans"
          anchor="configuring-and-managing-audits"
          title={_('Help: Audits')}
        />
        <ListIcon title={_('Audit List')} page="audits" />
        {entity.isAlterable() && !entity.isNew() && (
          <AlterableIcon
            title={_(
              'This is an Alterable Audit. Reports may not relate to ' +
                'current Policy or Target!',
            )}
          />
        )}
      </IconDivider>

      <IconDivider>
        <CloneIcon
          displayName={_('Audit')}
          entity={entity}
          name="audit"
          onClick={onAuditCloneClick}
        />
        <EditIcon
          displayName={_('Audit')}
          entity={entity}
          name="audit"
          onClick={onAuditEditClick}
        />
        <TrashIcon
          displayName={_('Audit')}
          entity={entity}
          name="audit"
          onClick={onAuditDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Audit as XML')}
          onClick={onAuditDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {hasValue(entity.schedule) && (
          <ScheduleIcon
            schedule={entity.schedule}
            schedulePeriods={entity.schedulePeriods}
            links={links}
          />
        )}
        <StartIcon
          task={entity}
          usageType={_('audit')}
          onClick={onAuditStartClick}
        />

        <StopIcon
          task={entity}
          usageType={_('audit')}
          onClick={onAuditStopClick}
        />

        {!entity.isContainer() && (
          <ResumeIcon
            task={entity}
            usageType={_('audit')}
            onClick={onAuditResumeClick}
          />
        )}
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {hasValue(currentReport) && (
            <DetailsLink
              type="report"
              id={currentReport.id}
              title={_('Current Report for Audit {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(currentReport.scanStart),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          {!hasValue(currentReport) && hasValue(lastReport) && (
            <DetailsLink
              type="report"
              id={lastReport.id}
              title={_('Last Report for Audit {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(lastReport.scanStart),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          <Link
            to="reports"
            filter={'audit_id=' + entity.id}
            title={_('Total Reports for Audit {{- name}}', entity)}
          >
            <Badge content={reportsCounts.total}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          to="results"
          filter={'audit_id=' + entity.id}
          title={_('Results for Audit {{- name}}', entity)}
        >
          <Badge content={currentResults}>
            <ResultIcon />
          </Badge>
        </Link>
      </Divider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onAuditCloneClick: PropTypes.func.isRequired,
  onAuditDeleteClick: PropTypes.func.isRequired,
  onAuditDownloadClick: PropTypes.func.isRequired,
  onAuditEditClick: PropTypes.func.isRequired,
  onAuditResumeClick: PropTypes.func.isRequired,
  onAuditStartClick: PropTypes.func.isRequired,
  onAuditStopClick: PropTypes.func.isRequired,
};

const Details = ({entity, ...props}) => {
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Name')}</TableData>
            <TableData>{entity.name}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{entity.comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Alterable')}</TableData>
            <TableData>{renderYesNo(entity.isAlterable())}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Status')}</TableData>
            <TableData>
              <AuditStatus task={entity} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <AuditDetails entity={entity} {...props} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = () => {
  // Page methods
  const {id} = useParams();
  const history = useHistory();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [downloadRef, handleDownload] = useDownload();
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  // Load audit related entities
  const {
    audit,
    refetch: refetchAudit,
    loading,
    error: entityError,
  } = useGetAudit(id);
  const {permissions = [], refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });

  // Audit related mutations
  const exportEntity = useExportEntity();

  const [cloneAudit] = useCloneAudit();
  const [deleteAudit] = useDeleteAudit();
  const exportAudit = useExportAuditsByIds();

  // Audit methods
  const handleCloneAudit = clonedAudit => {
    return cloneAudit(clonedAudit.id)
      .then(auditId => goto_entity_details('audit', {history})(auditId))
      .catch(showError);
  };

  const handleDeleteAudit = deletedAudit => {
    return deleteAudit(deletedAudit.id)
      .then(goto_list('audits', {history}))
      .catch(showError);
  };

  const handleDownloadAudit = exportedAudit => {
    exportEntity({
      entity: exportedAudit,
      exportFunc: exportAudit,
      resourceType: 'audits',
      onDownload: handleDownload,
      showError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(audit);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchAudit,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if audit is available and no timer is running yet
    if (hasValue(audit) && !hasRunningTimer) {
      startReload();
    }
  }, [audit, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <AuditComponent
      onCloned={goto_details('audit', {history})}
      onCloneError={showError}
      onDeleted={goto_list('audits', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onResumed={() => refetchAudit()}
      onResumeError={showError}
      onSaved={() => refetchAudit()}
      onStarted={() => refetchAudit()}
      onStartError={showError}
      onStopped={() => refetchAudit()}
      onStopError={showError}
    >
      {({edit, start, stop, resume}) => (
        <EntityPage
          entity={audit}
          entityError={entityError}
          entityType={'audit'}
          isLoading={loading}
          sectionIcon={<AuditIcon size="large" />}
          title={_('Audit')}
          toolBarIcons={ToolBarIcons}
          onChanged={() => refetchAudit()}
          onError={showError}
          onInteraction={renewSessionTimeout}
          onAuditCloneClick={handleCloneAudit}
          onAuditDeleteClick={handleDeleteAudit}
          onAuditDownloadClick={handleDownloadAudit}
          onAuditEditClick={edit}
          onAuditResumeClick={resume}
          onAuditStartClick={start}
          onAuditStopClick={stop}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Audit: {{name}}', {name: audit.name})} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <Details entity={audit} />
                      </TabPanel>
                      <TabPanel>
                        <AuditPermissions
                          entity={audit}
                          permissions={permissions}
                          onChanged={() => refetchPermissions()}
                          onDownloaded={handleDownload}
                          onInteraction={renewSessionTimeout}
                          onError={showError}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Layout>
                <DialogNotification
                  {...notificationDialogState}
                  onCloseClick={closeNotificationDialog}
                />
                <Download ref={downloadRef} />
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </AuditComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
