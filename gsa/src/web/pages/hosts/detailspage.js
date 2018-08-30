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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import SeverityBar from 'web/components/bar/severitybar';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';
import OsIcon from 'web/components/icon/osicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

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

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {
  selector as hostsSelector,
  loadEntity,
} from 'web/store/entities/hosts';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';

import HostDetails from './details';
import HostComponent from './component';

const ToolBarIcons = ({
  entity,
  onHostCloneClick,
  onHostCreateClick,
  onHostDeleteClick,
  onHostDownloadClick,
  onHostEditClick,
}) => {
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
  const {details = {}, routes = [], severity} = entity;
  const os_cpe = isDefined(details.best_os_cpe) ? details.best_os_cpe.value :
    undefined;
  const os_txt = isDefined(details.best_os_txt) ? details.best_os_txt.value :
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
                textOnly={!isDefined(os_cpe)}
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
                            textOnly={!isDefined(host.id)}
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
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onTagAddClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagEditClick,
  onTagEnableClick,
  onTagRemoveClick,
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
          entity={entity}
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
        >
          {({
            activeTab = 0,
            onActivateTab,
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
                      <Details
                        entity={entity}
                      />
                    </TabPanel>
                    <TabPanel>
                      <EntityTags
                        entity={entity}
                        onTagAddClick={onTagAddClick}
                        onTagDeleteClick={onTagDeleteClick}
                        onTagDisableClick={onTagDisableClick}
                        onTagEditClick={onTagEditClick}
                        onTagEnableClick={onTagEnableClick}
                        onTagCreateClick={onTagCreateClick}
                        onTagRemoveClick={onTagRemoveClick}
                      />
                    </TabPanel>
                    <TabPanel>
                      <EntityPermissions
                        entity={entity}
                        permissions={permissions}
                        onChanged={onChanged}
                        onDownloaded={onDownloaded}
                        onError={onError}
                      />
                    </TabPanel>
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
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch => {
    dispatch(loadEntityFunc(id));
    dispatch(loadPermissionsFunc(permissionsResourceFilter(id)));
  };
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('host', {
  entitySelector: hostsSelector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
