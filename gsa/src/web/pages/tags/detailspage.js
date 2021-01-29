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
import React from 'react';

import _ from 'gmp/locale';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';

import DisableIcon from 'web/components/icon/disableicon';
import EnableIcon from 'web/components/icon/enableicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';
import TagIcon from 'web/components/icon/tagicon';

import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {selector, loadEntity} from 'web/store/entities/tags';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';
import withCapabilties from 'web/utils/withCapabilities';

import ResourceList from './resourcelist';
import TagComponent from './component';
import TagDetails from './details';
import EntityPermissions from 'web/entity/permissions';

const ToolBarIcons = withCapabilties(
  ({
    capabilities,
    entity,
    onTagCloneClick,
    onTagCreateClick,
    onTagDeleteClick,
    onTagDisableClick,
    onTagDownloadClick,
    onTagEditClick,
    onTagEnableClick,
  }) => {
    let endisableable = null;

    if (capabilities.mayEdit('tag')) {
      if (entity.isActive()) {
        endisableable = (
          <DisableIcon
            value={entity}
            title={_('Disable Tag')}
            onClick={onTagDisableClick}
          />
        );
      } else {
        endisableable = (
          <EnableIcon
            value={entity}
            title={_('Enable Tag')}
            onClick={onTagEnableClick}
          />
        );
      }
    }
    return (
      <Divider margin="10px">
        <IconDivider>
          <ManualIcon
            page="web-interface"
            anchor="managing-tags"
            title={_('Help: Tags')}
          />
          <ListIcon title={_('Tag List')} page="tags" />
        </IconDivider>
        <IconDivider>
          <CreateIcon entity={entity} onClick={onTagCreateClick} />
          <CloneIcon entity={entity} onClick={onTagCloneClick} />
          <EditIcon entity={entity} onClick={onTagEditClick} />
          <TrashIcon entity={entity} onClick={onTagDeleteClick} />
          <ExportIcon
            value={entity}
            title={_('Export Tag as XML')}
            onClick={onTagDownloadClick}
          />
          {endisableable}
        </IconDivider>
      </Divider>
    );
  },
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTagCloneClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagDownloadClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  return (
    <TagComponent
      onCloned={goto_details('tag', props)}
      onCloneError={onError}
      onCreated={goto_details('tag', props)}
      onDeleted={goto_list('tags', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onDisableError={onError}
      onDisabled={onChanged}
      onEnableError={onError}
      onEnabled={onChanged}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        enable,
        disable,
        save,
        remove,
      }) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<TagIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Tag')}
          onInteraction={onInteraction}
          onTagCloneClick={clone}
          onTagCreateClick={create}
          onTagDeleteClick={delete_func}
          onTagDownloadClick={download}
          onTagEditClick={edit}
          onTagSaveClick={save}
          onTagEnableClick={enable}
          onTagDisableClick={disable}
          onTagRemoveClick={remove}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Tag: {{name}}', {name: entity.name})} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab count={entity.resourceCount}>
                        {_('Assigned Items')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <TagDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <ResourceList entity={entity} />
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
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </TagComponent>
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

export default withEntityContainer('tag', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
