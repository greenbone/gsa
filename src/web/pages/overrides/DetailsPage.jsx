/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {connect} from 'react-redux';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import OverrideIcon from 'web/components/icon/OverrideIcon';
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
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPage, {Col} from 'web/entity/Page';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import OverrideComponent from 'web/pages/overrides/Component';
import OverrideDetails from 'web/pages/overrides/Details';
import {
  selector as overridesSelector,
  loadEntity,
} from 'web/store/entities/overrides';
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
  onOverrideCloneClick,
  onOverrideCreateClick,
  onOverrideDeleteClick,
  onOverrideDownloadClick,
  onOverrideEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        anchor="managing-overrides"
        page="reports"
        title={_('Help: Overrides')}
      />
      <ListIcon page="overrides" title={_('Override List')} />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onOverrideCreateClick} />
      <CloneIcon entity={entity} onClick={onOverrideCloneClick} />
      <EditIcon entity={entity} onClick={onOverrideEditClick} />
      <TrashIcon entity={entity} onClick={onOverrideDeleteClick} />
      <ExportIcon
        title={_('Export Override as XML')}
        value={entity}
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

const Details = connect(rootState => ({
  timezone: getTimezone(rootState),
}))(({entity, timezone, ...props}) => {
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

      <OverrideDetails entity={entity} {...props} />
    </Layout>
  );
});

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onError,
  onChanged,
  onDownloaded,
  onInteraction,
  ...props
}) => (
  <OverrideComponent
    onCloneError={onError}
    onCloned={goToDetails('override', props)}
    onCreated={goToDetails('override', props)}
    onDeleteError={onError}
    onDeleted={goToList('overrides', props)}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, create, delete: delete_func, download, edit, save}) => (
      <React.Fragment>
        <PageTitle title={_('Override Details')} />
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<OverrideIcon size="large" />}
          title={_('Override')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
          onOverrideCloneClick={clone}
          onOverrideCreateClick={create}
          onOverrideDeleteClick={delete_func}
          onOverrideDownloadClick={download}
          onOverrideEditClick={edit}
          onOverrideSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <Layout flex="column" grow="1">
                <TabLayout align={['start', 'end']} grow="1">
                  <TabList
                    active={activeTab}
                    align={['start', 'stretch']}
                    onActivateTab={onActivateTab}
                  >
                    <Tab>{_('Information')}</Tab>
                    <EntitiesTab entities={entity.userTags}>
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
              </Layout>
            );
          }}
        </EntityPage>
      </React.Fragment>
    )}
  </OverrideComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadOverride = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadOverride(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('override', {
  entitySelector: overridesSelector,
  load,
  mapStateToProps,
})(Page);
