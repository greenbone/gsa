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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Link from 'web/components/link/link';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import DetailsBlock from 'web/entity/block';
import Note from 'web/entity/note';
import Override from 'web/entity/override';
import EntityPage from 'web/entity/page';
import EntityContainer, {loader} from 'web/entity/container';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import NvtComponent from './component';
import NvtDetails from './details';
import Preferences from './preferences';

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
  const {preferences, default_timeout} = entity;
  return (
    <Layout flex="column">

      <NvtDetails
        entity={entity}
      />

      <DetailsBlock
        title={_('Preferences')}
      >
        <Preferences
          preferences={preferences}
          default_timeout={default_timeout}
        />
      </DetailsBlock>

      {overrides.length > 0 &&
        <DetailsBlock
          id="overrides"
          title={_('Overrides')}
        >
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px"
          >
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
          title={_('Notes')}
        >
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px"
          >
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
  entity,
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
        entity={entity}
        toolBarIcons={ToolBarIcons}
        title={_('NVT')}
        sectionIcon="nvt.svg"
        onChanged={onChanged}
        onNoteCreateClick={nvt => open_dialog(nvt, notecreate)}
        onNvtDownloadClick={download}
        onOverrideCreateClick={nvt => open_dialog(nvt, overridecreate)}
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
  entity: PropTypes.model,
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
        notes={isDefined(notes) ? notes.entities : undefined}
        overrides={isDefined(overrides) ? overrides.entities : undefined}
      />
    )}
  </EntityContainer>
);

export default NvtPage;

// vim: set ts=2 sw=2 tw=80:
