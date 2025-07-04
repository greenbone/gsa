/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {connect} from 'react-redux';
import {isDefined} from 'gmp/utils/identity';
import {NoteIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/TableRow';
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import NoteDetails from 'web/pages/notes/Details';
import NoteComponent from 'web/pages/notes/NoteComponent';
import {selector as notesSelector, loadEntity} from 'web/store/entities/notes';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {getTimezone} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import {formattedUserSettingLongDate} from 'web/utils/userSettingTimeDateFormatters';
export const ToolBarIcons = ({
  entity,
  onNoteCloneClick,
  onNoteCreateClick,
  onNoteDeleteClick,
  onNoteDownloadClick,
  onNoteEditClick,
}) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-notes"
          page="reports"
          title={_('Help: Notes')}
        />
        <ListIcon page="notes" title={_('Note List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onNoteCreateClick} />
        <CloneIcon entity={entity} onClick={onNoteCloneClick} />
        <EditIcon entity={entity} onClick={onNoteEditClick} />
        <TrashIcon entity={entity} onClick={onNoteDeleteClick} />
        <ExportIcon
          title={_('Export Note as XML')}
          value={entity}
          onClick={onNoteDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onNoteCloneClick: PropTypes.func.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onNoteDeleteClick: PropTypes.func.isRequired,
  onNoteDownloadClick: PropTypes.func.isRequired,
  onNoteEditClick: PropTypes.func.isRequired,
};

const Details = connect(rootState => ({
  timezone: getTimezone(rootState),
}))(({entity, timezone, ...props}) => {
  const [_] = useTranslation();
  const {nvt} = entity;
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
                    enddate: formattedUserSettingLongDate(
                      entity.endTime,
                      timezone,
                    ),
                  })}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <NoteDetails entity={entity} {...props} />
    </Layout>
  );
});

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  permissions = [],
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <NoteComponent
      onCloneError={onError}
      onCloned={goToDetails('note', props)}
      onCreated={goToDetails('note', props)}
      onDeleteError={onError}
      onDeleted={goToList('notes', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<NoteIcon size="large" />}
          title={_('Note')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
          onNoteCloneClick={clone}
          onNoteCreateClick={create}
          onNoteDeleteClick={delete_func}
          onNoteDownloadClick={download}
          onNoteEditClick={edit}
          onNoteSaveClick={save}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle title={_('Note Details')} />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs>
                    <TabPanels>
                      <TabPanel>
                        <Details entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
                          onError={onError}
                          onInteraction={onInteraction}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={entity}
                          permissions={permissions}
                          onChanged={onChanged}
                          onDownloaded={onDownloaded}
                          onError={onError}
                          onInteraction={onInteraction}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabsContainer>
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </NoteComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('note', {
  entitySelector: notesSelector,
  load,
  mapStateToProps,
})(Page);
