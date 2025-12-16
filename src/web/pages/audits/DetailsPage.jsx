/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {AuditIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import TabsContainer from 'web/components/tab/TabsContainer';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import {goToDetails, goToList} from 'web/entity/navigation';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import AuditComponent from 'web/pages/audits/AuditComponent';
import AuditDetailsPageToolBarIcons from 'web/pages/audits/AuditDetailsPageToolBarIcons';
import AuditDetails from 'web/pages/audits/Details';
import {
  TaskPermissions as AuditPermissions,
  reloadInterval,
} from 'web/pages/tasks/TaskDetailsPage';
import AuditStatus from 'web/pages/tasks/TaskStatus';
import {
  selector as auditSelector,
  loadEntity as loadAudit,
} from 'web/store/entities/audits';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';

const Details = ({entity, ...props}) => {
  const [_] = useTranslation();
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
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

  ...props
}) => {
  const [_] = useTranslation();

  return (
    <AuditComponent
      onCloneError={onError}
      onCloned={goToDetails('audit', props)}
      onContainerSaved={onChanged}
      onDeleteError={onError}
      onDeleted={goToList('audits', props)}
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
      {({clone, delete: deleteFunc, download, edit, start, stop, resume}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<AuditIcon size="large" />}
          title={_('Audit')}
          toolBarIcons={AuditDetailsPageToolBarIcons}
          onAuditCloneClick={clone}
          onAuditDeleteClick={deleteFunc}
          onAuditDownloadClick={download}
          onAuditEditClick={edit}
          onAuditResumeClick={resume}
          onAuditStartClick={start}
          onAuditStopClick={stop}
          onChanged={onChanged}
          onError={onError}
        >
          {() => {
            return (
              <>
                <PageTitle title={_('Audit: {{name}}', {name: entity.name})} />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <TabsContainer flex="column" grow="1">
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
                          onError={onError}
                        />
                      </TabPanel>
                    </TabPanels>
                  </TabsContainer>
                </TabsContainer>
              </>
            );
          }}
        </EntityPage>
      )}
    </AuditComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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
