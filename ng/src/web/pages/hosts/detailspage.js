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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';
import OsIcon from '../../components/icon/osicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

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

import HostDetails from './details.js';
import HostComponent from './component.js';

const ToolBarIcons = ({
  entity,
  onHostCloneClick,
  onHostCreateClick,
  onHostDeleteClick,
  onHostDownloadClick,
  onHostEditClick,
}, {capabilities}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="host-details"
          title={_('Help: Host Details')}
        />
        <ListIcon
          title={_('Host List')}
          page="hosts"
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostCreateClick}
        />
        <CloneIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostCloneClick}
        />
        <EditIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostEditClick}
        />
        <TrashIcon
          entity={entity}
          displayName={_('Host')}
          onClick={onHostDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Host as XML')}
          onClick={onHostDownloadClick}
        />
      </IconDivider>
      <IconDivider>
        <Link
          to="results"
          filter={'host=' + entity.name}
          title={_('Results for this Host')}
        >
          <Icon
            img="report.svg"
          />
        </Link>
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onHostCloneClick: PropTypes.func.isRequired,
  onHostCreateClick: PropTypes.func.isRequired,
  onHostDeleteClick: PropTypes.func.isRequired,
  onHostDownloadClick: PropTypes.func.isRequired,
  onHostEditClick: PropTypes.func.isRequired,
};

const RouteList = glamorous.ul({
  margin: 0,
  paddingLeft: '20px',
});

const Hop = glamorous.div({
  display: 'inline-flex',
  '&:not(:last-child) > *': {
    paddingRight: '5px',
  },
  '&:not(:last-child)': {
    paddingRight: '5px',
  },
  '&:not(:last-child)::after': {
    content: `'►'`, // \u25BA == &#9658;
  },
});

const Details = ({
  entity,
  ...props
}) => {
  const {details = {}, routes, severity} = entity;
  const os_cpe = is_defined(details.best_os_cpe) ? details.best_os_cpe.value :
    undefined;
  const os_txt = is_defined(details.best_os_txt) ? details.best_os_txt.value :
    undefined;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Hostname')}
            </TableData>
            <TableData>
              {entity.hostname}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('IP Address')}
            </TableData>
            <TableData>
              {entity.ip}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Comment')}
            </TableData>
            <TableData>
              {entity.comment}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('OS')}
            </TableData>
            <TableData>
              <DetailsLink
                type="cpe"
                textOnly={!is_defined(os_cpe)}
                id={os_cpe}
              >
                <OsIcon
                  displayOsName
                  osCpe={os_cpe}
                  osTxt={os_txt}
                />
              </DetailsLink>
            </TableData>
          </TableRow>

          {routes.length > 0 &&
            <TableRow>
              <TableData>
                {_('Route')}
              </TableData>
              <TableData>
                <RouteList>
                  {routes.map((route, idx) => (
                    <li key={idx}>
                      {route.map(host => (
                        <Hop key={host.ip}>
                          <DetailsLink
                            type="host"
                            id={host.id}
                            textOnly={!is_defined(host.id)}
                          >
                            {host.ip}
                          </DetailsLink>
                        </Hop>
                      ))}
                    </li>
                  ))}
                </RouteList>
              </TableData>
            </TableRow>
          }

          <TableRow>
            <TableData>
              {_('Severity')}
            </TableData>
            <TableData>
              <SeverityBar
                severity={severity}
              />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <HostDetails
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
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  const goto_host = goto_details('host', props);
  return (
    <HostComponent
      onTargetCreated={goto_details('target', props)}
      onTargetCreateError={onError}
      onCloned={goto_host}
      onCloneError={onError}
      onCreated={goto_host}
      onDeleted={goto_list('hosts', props)}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onIdentifierDeleted={onChanged}
      onIdentifierDeleteError={onError}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        deleteidentifier,
        download,
        edit,
      }) => (
        <EntityPage
          {...props}
          detailsComponent={Details}
          sectionIcon="host.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Host')}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onHostCloneClick={clone}
          onHostCreateClick={create}
          onHostDeleteClick={delete_func}
          onHostDownloadClick={download}
          onHostEditClick={edit}
          onHostIdentifierDeleteClick={deleteidentifier}
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
    </HostComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const HostPage = props => (
  <EntityContainer
    {...props}
    name="host"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default HostPage;

// vim: set ts=2 sw=2 tw=80:
