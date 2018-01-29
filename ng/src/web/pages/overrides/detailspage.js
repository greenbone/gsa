/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import {render_yesno} from '../../utils/render.js';
import PropTypes from '../../utils/proptypes.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import OverrideDetails from './details.js';
import OverrideComponent from './component.js';

const ToolBarIcons = ({
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
        page="vulnerabilitymanagement"
        anchor="overrides-and-false-positives"
        title={_('Help: Overrides')}
      />
      <ListIcon
        title={_('Override List')}
        page="overrides"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onOverrideCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onOverrideCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onOverrideEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onOverrideDeleteClick}
      />
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

const Details = ({
  entity,
  ...props
}) => {
  const {nvt} = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('NVT Name')}
            </TableData>
            <TableData>
              {is_defined(nvt) ?
                <DetailsLink
                  id={nvt.id}
                  type="nvt"
                >
                  {nvt.name}
                </DetailsLink> :
                _('None. Result was an open port.')
              }
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('NVT OID')}
            </TableData>
            <TableData>
              {nvt.id}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Active')}
            </TableData>
            <TableData>
              {render_yesno(entity.isActive())}
              {entity.isActive() && is_defined(entity.end_time) &&
                ' ' + _('until {{- enddate}}',
                  {enddate: datetime(entity.end_time)})
              }
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <OverrideDetails
        entity={entity}
        {...props}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onError,
  onChanged,
  onDownloaded,
  ...props
}) => (
  <OverrideComponent
    onCloned={goto_details('override', props)}
    onCloneError={onError}
    onCreated={goto_details('override', props)}
    onDeleted={goto_list('overrides', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
    }) => (
      <EntityPage
        {...props}
        sectionIcon="override.svg"
        title={_('Override')}
        detailsComponent={Details}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onDownloaded={onDownloaded}
        onError={onError}
        onOverrideCloneClick={clone}
        onOverrideCreateClick={create}
        onOverrideDeleteClick={delete_func}
        onOverrideDownloadClick={download}
        onOverrideEditClick={edit}
        onOverrideSaveClick={save}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      >
        {({
          activeTab = 0,
          permissionsComponent,
          permissionsTitle,
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
        }) => {
          return (
            <Layout grow="1" flex="column">
              <TabLayout
                grow="1"
                align={['start', 'end']}
              >
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={onActivateTab}
                >
                  <Tab>
                    {_('Information')}
                  </Tab>
                  {is_defined(tagsComponent) &&
                    <Tab>
                      {tagsTitle}
                    </Tab>
                  }
                  {is_defined(permissionsComponent) &&
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  }
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Details
                      entity={entity}
                    />
                  </TabPanel>
                  {is_defined(tagsComponent) &&
                    <TabPanel>
                      {tagsComponent}
                    </TabPanel>
                  }
                  {is_defined(permissionsComponent) &&
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  }
                </TabPanels>
              </Tabs>
            </Layout>
          );
        }}
      </EntityPage>
    )}
  </OverrideComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const OverridePage = props => (
  <EntityContainer
    {...props}
    name="override"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default OverridePage;

// vim: set ts=2 sw=2 tw=80:
