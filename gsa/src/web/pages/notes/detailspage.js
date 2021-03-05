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
import NoteIcon from 'web/components/icon/noteicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import useReload from 'web/components/loading/useReload';
import DetailsLink from 'web/components/link/detailslink';

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

import {
  useCloneNote,
  useDeleteNotesByIds,
  useExportNotesByIds,
  useGetNote,
} from 'web/graphql/notes';
import {useGetPermissions} from 'web/graphql/permissions';

import {goto_list} from 'web/entity/component';
import EntityPage, {Col} from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import useExportEntity from 'web/entity/useExportEntity';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {goto_entity_details} from 'web/utils/graphql';
import {renderYesNo} from 'web/utils/render';
import PropTypes from 'web/utils/proptypes';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import useUserTimezone from 'web/utils/useUserTimezone';

import NoteDetails from './details';
import NoteComponent from './component';

export const ToolBarIcons = ({
  entity,
  onNoteCloneClick,
  onNoteCreateClick,
  onNoteDeleteClick,
  onNoteDownloadClick,
  onNoteEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="managing-notes"
        title={_('Help: Notes')}
      />
      <ListIcon title={_('Note List')} page="notes" />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onNoteCreateClick} />
      <CloneIcon entity={entity} onClick={onNoteCloneClick} />
      <EditIcon entity={entity} onClick={onNoteEditClick} />
      <TrashIcon entity={entity} onClick={onNoteDeleteClick} />
      <ExportIcon
        value={entity}
        title={_('Export Note as XML')}
        onClick={onNoteDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onNoteCloneClick: PropTypes.func.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onNoteDeleteClick: PropTypes.func.isRequired,
  onNoteDownloadClick: PropTypes.func.isRequired,
  onNoteEditClick: PropTypes.func.isRequired,
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

      <NoteDetails entity={entity} {...props} />
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

  // Load note related entities
  const {note, refetch: refetchNote, loading, error: entityError} = useGetNote(
    id,
  );
  const {permissions, refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });

  // note related mutations
  const exportEntity = useExportEntity();
  const [cloneNote] = useCloneNote();
  const [deleteNote] = useDeleteNotesByIds();
  const exportNote = useExportNotesByIds();

  // note methods
  const handleCloneNote = clonedNote => {
    return cloneNote(clonedNote.id)
      .then(noteId => goto_entity_details('note', {history})(noteId))
      .catch(showError);
  };

  const handleDeleteNote = deletedNote => {
    return deleteNote([deletedNote.id])
      .then(goto_list('notes', {history}))
      .catch(showError);
  };

  const handleDownloadNote = exportedNote => {
    exportEntity({
      entity: exportedNote,
      exportFunc: exportNote,
      resourceType: 'notes',
      onDownload: handleDownload,
      showError,
    });
  };

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(note);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchNote,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if schedule is available and no timer is running yet
    if (hasValue(note) && !hasRunningTimer) {
      startReload();
    }
  }, [note, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <NoteComponent
      onCloned={goto_entity_details('note', {history})}
      onCloneError={showError}
      onCreated={goto_entity_details('note', {history})}
      onDeleted={goto_list('notes', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={() => refetchNote()}
    >
      {({create, edit, save}) => (
        <EntityPage
          entity={note}
          entityError={entityError}
          entityType={'note'}
          isLoading={loading}
          sectionIcon={<NoteIcon size="large" />}
          title={_('Note')}
          toolBarIcons={ToolBarIcons}
          onInteraction={renewSessionTimeout}
          onNoteCloneClick={handleCloneNote}
          onNoteCreateClick={create}
          onNoteDeleteClick={handleDeleteNote}
          onNoteDownloadClick={handleDownloadNote}
          onNoteEditClick={edit}
          onNoteSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Note Details')} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={note.userTags}>
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
                        <Details entity={note} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={note}
                          onChanged={() => refetchNote()}
                          onError={showError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={note}
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
      )}
    </NoteComponent>
  );
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
