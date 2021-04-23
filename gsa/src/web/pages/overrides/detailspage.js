/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {longDate} from 'gmp/locale/date';

import {hasValue, isDefined} from 'gmp/utils/identity';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import OverrideIcon from 'web/components/icon/overrideicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';

import DetailsLink from 'web/components/link/detailslink';

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

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import EntityPage, {Col} from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import useExportEntity from 'web/entity/useExportEntity';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';

import {
  useCloneOverride,
  useDeleteOverridesByIds,
  useExportOverridesByIds,
  useGetOverride,
} from 'web/graphql/overrides';
import {useGetPermissions} from 'web/graphql/permissions';

import {goto_entity_details} from 'web/utils/graphql';

import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserTimezone from 'web/utils/useUserTimezone';

import OverrideDetails from './details';
import OverrideComponent from './component';

export const ToolBarIcons = ({
  entity,
  onOverrideCloneClick,
  onOverrideCreateClick,
  onOverrideDeleteClick,
  onOverrideDownloadClick,
  onOverrideEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="managing-overrides"
        title={_('Help: Overrides')}
      />
      <ListIcon title={_('Override List')} page="overrides" />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onOverrideCreateClick} />
      <CloneIcon entity={entity} onClick={onOverrideCloneClick} />
      <EditIcon entity={entity} onClick={onOverrideEditClick} />
      <TrashIcon entity={entity} onClick={onOverrideDeleteClick} />
      <ExportIcon
        value={entity}
        title={_('Export Override as XML')}
        onClick={onOverrideDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onOverrideCloneClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
  onOverrideDeleteClick: PropTypes.func.isRequired,
  onOverrideDownloadClick: PropTypes.func.isRequired,
  onOverrideEditClick: PropTypes.func.isRequired,
};

const Details = ({entity, ...props}) => {
  const {nvt} = entity;
  const [timezone] = useUserTimezone();
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('NVT Name')}</TableData>
            <TableData>
              {isDefined(nvt) ? (
                <span>
                  <DetailsLink id={nvt.id} type="nvt">
                    {nvt.name}
                  </DetailsLink>
                </span>
              ) : (
                _('None. Result was an open port.')
              )}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('NVT OID')}</TableData>
            <TableData>{nvt.id}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Active')}</TableData>
            <TableData>
              {renderYesNo(entity.isActive())}
              {entity.isActive() &&
                isDefined(entity.endTime) &&
                ' ' +
                  _('until {{- enddate}}', {
                    enddate: longDate(entity.endTime, timezone),
                  })}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <OverrideDetails entity={entity} {...props} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = () => {
  const {id} = useParams();
  const history = useHistory();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [downloadRef, handleDownload] = useDownload();
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const {
    override,
    refetch: refetchOverride,
    loading,
    error: entityError,
  } = useGetOverride(id);
  const {permissions, refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });
  const exportEntity = useExportEntity();
  const [cloneOverride] = useCloneOverride();
  const [deleteOverride] = useDeleteOverridesByIds();
  const exportOverride = useExportOverridesByIds();

  const handleCloneOverride = clonedOverride => {
    return cloneOverride(clonedOverride.id)
      .then(overrideId =>
        goto_entity_details('override', {history})(overrideId),
      )
      .catch(showError);
  };

  const handleDeleteOverride = deletedOverride => {
    return deleteOverride([deletedOverride.id])
      .then(goto_list('overrides', {history}))
      .catch(showError);
  };

  const handleDownloadOverride = exportedOverride => {
    exportEntity({
      entity: exportedOverride,
      exportFunc: exportOverride,
      resourceType: 'overrides',
      onDownload: handleDownload,
      showError,
    });
  };

  const timeoutFunc = useEntityReloadInterval(override);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchOverride,
    timeoutFunc,
  );

  useEffect(() => {
    if (hasValue(override) && !hasRunningTimer) {
      startReload();
    }
  }, [override, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <OverrideComponent
      onCloned={goto_details('override', {history})}
      onCloneError={showError}
      onCreated={goto_entity_details('override', {history})}
      onDeleted={goto_list('overrides', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={() => refetchOverride()}
    >
      {({create, edit, save}) => (
        <React.Fragment>
          <PageTitle title={_('Override Details')} />
          <EntityPage
            entity={override}
            entityError={entityError}
            isLoading={loading}
            sectionIcon={<OverrideIcon size="large" />}
            title={_('Override')}
            toolBarIcons={ToolBarIcons}
            onInteraction={renewSessionTimeout}
            onOverrideCloneClick={handleCloneOverride}
            onOverrideCreateClick={create}
            onOverrideDeleteClick={handleDeleteOverride}
            onOverrideDownloadClick={handleDownloadOverride}
            onOverrideEditClick={edit}
            onOverrideSaveClick={save}
          >
            {({activeTab = 0, onActivateTab}) => {
              return (
                <React.Fragment>
                  <Layout grow="1" flex="column">
                    <TabLayout grow="1" align={['start', 'end']}>
                      <TabList
                        active={activeTab}
                        align={['start', 'stretch']}
                        onActivateTab={onActivateTab}
                      >
                        <Tab>{_('Information')}</Tab>
                        <EntitiesTab entities={override.userTags}>
                          {_('User Tags')}
                        </EntitiesTab>
                        <EntitiesTab entities={permissions}>
                          {_('Permissions')}
                        </EntitiesTab>
                      </TabList>
                    </TabLayout>

                    <Tabs active={activeTab}>
                      <TabPanels>
                        <TabPanel>
                          <Details entity={override} />
                        </TabPanel>
                        <TabPanel>
                          <EntityTags
                            entity={override}
                            onChanged={() => refetchOverride()}
                            onDownloaded={handleDownload}
                            onError={showError}
                            onInteraction={renewSessionTimeout}
                          />
                        </TabPanel>
                        <TabPanel>
                          <EntityPermissions
                            entity={override}
                            permissions={permissions}
                            onChanged={() => refetchPermissions()}
                            onDownloaded={handleDownload}
                            onError={showError}
                            onInteraction={renewSessionTimeout}
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
        </React.Fragment>
      )}
    </OverrideComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
