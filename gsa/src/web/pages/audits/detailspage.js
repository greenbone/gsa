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

import React from 'react';

import _ from 'gmp/locale';
import {shortDate} from 'gmp/locale/date';

import {hasValue, isDefined} from 'gmp/utils/identity';

import Badge from 'web/components/badge/badge';

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

import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/reload';

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
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import ResumeIcon from 'web/pages/tasks/icons/resumeicon';
import ScheduleIcon from 'web/pages/tasks/icons/scheduleicon';
import StartIcon from 'web/pages/tasks/icons/starticon';
import StopIcon from 'web/pages/tasks/icons/stopicon';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {
  selector as auditSelector,
  loadEntity as loadAudit,
} from 'web/store/entities/audits';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';

import AuditDetails from './details';
import AuditStatus from 'web/pages/tasks/status';
import AuditComponent from './component';

import {TaskPermissions as AuditPermissions} from 'web/pages/tasks/detailspage';

const reloadInterval = ({entity}) => {
  if (!hasValue(entity) || entity.isContainer()) {
    return NO_RELOAD;
  }
  return entity.isActive()
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;
};

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
          name="task"
          onClick={onAuditCloneClick}
        />
        <EditIcon
          displayName={_('Audit')}
          entity={entity}
          name="task"
          onClick={onAuditEditClick}
        />
        <TrashIcon
          displayName={_('Audit')}
          entity={entity}
          name="task"
          onClick={onAuditDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Audit as XML')}
          onClick={onAuditDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {isDefined(entity.schedule) && (
          <ScheduleIcon
            schedule={entity.schedule}
            schedulePeriods={entity.schedule_periods}
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
          {isDefined(entity.current_report) && (
            <DetailsLink
              type="report"
              id={entity.current_report.id}
              title={_('Current Report for Audit {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(entity.current_report.scan_start),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          {!isDefined(entity.current_report) && isDefined(entity.last_report) && (
            <DetailsLink
              type="report"
              id={entity.last_report.id}
              title={_('Last Report for Audit {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(entity.last_report.scan_start),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          <Link
            to="reports"
            filter={'task_id=' + entity.id}
            title={_('Total Reports for Audit {{- name}}', entity)}
          >
            <Badge content={entity.report_count.total}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          to="results"
          filter={'task_id=' + entity.id}
          title={_('Results for Audit {{- name}}', entity)}
        >
          <Badge content={entity.result_count}>
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

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <AuditComponent
    onCloned={goto_details('audit', props)}
    onCloneError={onError}
    onContainerSaved={onChanged}
    onDeleted={goto_list('audits', props)}
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
    {({clone, delete: deleteFunc, download, edit, start, stop, resume}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<AuditIcon size="large" />}
        title={_('Audit')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onError={onError}
        onInteraction={onInteraction}
        onAuditCloneClick={clone}
        onAuditDeleteClick={deleteFunc}
        onAuditDownloadClick={download}
        onAuditEditClick={edit}
        onAuditResumeClick={resume}
        onAuditStartClick={start}
        onAuditStopClick={stop}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle title={_('Audit: {{name}}', {name: entity.name})} />
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
                      <Details entity={entity} />
                    </TabPanel>
                    <TabPanel>
                      <AuditPermissions
                        entity={entity}
                        permissions={permissions}
                        onChanged={onChanged}
                        onDownloaded={onDownloaded}
                        onInteraction={onInteraction}
                        onError={onError}
                      />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Layout>
            </React.Fragment>
          );
        }}
      </EntityPage>
    )}
  </AuditComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const mapStateToProps = (rootState, {id}) => {
  const permSel = permissionsSelector(rootState);
  return {
    permissions: permSel.getEntities(permissionsResourceFilter(id)),
  };
};

const load = gmp => {
  const loadAuditFunc = loadAudit(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadAuditFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

export default withEntityContainer('audit', {
  load,
  entitySelector: auditSelector,
  mapStateToProps,
  reloadInterval,
})(Page);

// vim: set ts=2 sw=2 tw=80:
