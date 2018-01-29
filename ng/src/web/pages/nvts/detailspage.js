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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import DetailsBlock from '../../entity/block.js';
import Note from '../../entity/note.js';
import Override from '../../entity/override.js';
import EntityPage from '../../entity/page.js';
import EntityContainer, {loader} from '../../entity/container.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

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

import NvtComponent from './component.js';
import NvtDetails from './details.js';
import Preferences from './preferences.js';

let ToolBarIcons = ({
  capabilities,
  entity,
  onNoteCreateClick,
  onNvtDownloadClick,
  onOverrideCreateClick,
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="network-vulnerability-tests"
          title={_('Help: NVTs')}
        />
        <ListIcon
          title={_('NVT List')}
          page="nvts"
        />
      </IconDivider>

      <ExportIcon
        value={entity}
        title={_('Export NVT')}
        onClick={onNvtDownloadClick}
      />

      <IconDivider>
        {capabilities.mayCreate('note') &&
          <Icon
            img="new_note.svg"
            title={_('Add new Note')}
            value={entity}
            onClick={onNoteCreateClick}
          />
        }
        {capabilities.mayCreate('override') &&
          <Icon
            img="new_override.svg"
            title={_('Add new Override')}
            value={entity}
            onClick={onOverrideCreateClick}
          />
        }
      </IconDivider>

      <IconDivider>
        {capabilities.mayAccess('results') &&
          <Link
            to="results"
            filter={'nvt=' + entity.id}
          >
            <Icon
              img="result.svg"
              title={_('Corresponding Results')}
            />
          </Link>
        }
        {capabilities.mayAccess('vulns') &&
          <Link
            to="vulnerabilities"
            filter={'uuid=' + entity.id}
          >
            <Icon
              img="vulnerability.svg"
              title={_('Corresponding Vulnerabilities')}
            />
          </Link>
        }
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onNvtDownloadClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
};

ToolBarIcons = withCapabilities(ToolBarIcons);

const Details = ({
  entity,
  notes = [],
  overrides = [],
}) => {
  overrides = overrides.filter(override => override.isActive());
  notes = notes.filter(note => note.isActive());
  const {version, family, oid, preferences, default_timeout} = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Family')}
            </TableData>
            <TableData>
              {family}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('OID')}
            </TableData>
            <TableData>
              {oid}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Version')}
            </TableData>
            <TableData>
              {version}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <NvtDetails
        entity={entity}
      />

      <DetailsBlock
        title={_('Preferences')}>
        <Preferences
          preferences={preferences}
          default_timeout={default_timeout}
        />
      </DetailsBlock>

      {overrides.length > 0 &&
        <DetailsBlock
          id="overrides"
          title={_('Overrides')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
            {
              overrides.map(override => (
                <Override
                  key={override.id}
                  override={override}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }

      {notes.length > 0 &&
        <DetailsBlock
          id="notes"
          title={_('Notes')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
            {
              notes.map(note => (
                <Note
                  key={note.id}
                  note={note}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  notes: PropTypes.array,
  overrides: PropTypes.array,
};

const open_dialog = (nvt, func) => {
  func({
    fixed: true,
    nvt,
    oid: nvt.oid,
  });
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <NvtComponent
    onChanged={onChanged}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
  >
    {({
      notecreate,
      overridecreate,
      download,
    }) => (
      <EntityPage
        {...props}
        detailsComponent={Details}
        permissionsComponent={false}
        toolBarIcons={ToolBarIcons}
        title={_('NVT')}
        sectionIcon="nvt.svg"
        onChanged={onChanged}
        onNoteCreateClick={nvt => open_dialog(nvt, notecreate)}
        onNvtDownloadClick={download}
        onOverrideCreateClick={nvt => open_dialog(nvt, overridecreate)}
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
  </NvtComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const nvt_id_filter = id => 'nvt_id=' + id;

const NvtPage = props => (
  <EntityContainer
    {...props}
    name="nvt"
    loaders={[
      loader('notes', nvt_id_filter),
      loader('overrides', nvt_id_filter),
    ]}
  >
    {({
      notes,
      overrides,
      ...cprops
    }) => (
      <Page
        {...props}
        {...cprops}
        notes={is_defined(notes) ? notes.entities : undefined}
        overrides={is_defined(overrides) ? overrides.entities : undefined}
      />
    )}
  </EntityContainer>
);

export default NvtPage;

// vim: set ts=2 sw=2 tw=80:
