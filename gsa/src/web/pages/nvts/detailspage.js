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

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import ExportIcon from 'web/components/icon/exporticon';
import VulnerabilityIcon from 'web/components/icon/vulnerabilityicon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewNoteIcon from 'web/components/icon/newnoteicon';
import NewOverrideIcon from 'web/components/icon/newoverrideicon';
import NvtIcon from 'web/components/icon/nvticon';
import ResultIcon from 'web/components/icon/resulticon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

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
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer from 'web/entity/withEntityContainer';

import {
  selector as notesSelector,
  loadEntities as loadNotes,
} from 'web/store/entities/notes';

import {selector as nvtsSelector, loadEntity} from 'web/store/entities/nvts';

import {
  selector as overridesSelector,
  loadEntities as loadOverrides,
} from 'web/store/entities/overrides';

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
          page="managing-secinfo"
          anchor="network-vulnerability-tests-nvt"
          title={_('Help: NVTs')}
        />
        <ListIcon title={_('NVT List')} page="nvts" />
      </IconDivider>

      <ExportIcon
        value={entity}
        title={_('Export NVT')}
        onClick={onNvtDownloadClick}
      />

      <IconDivider>
        {capabilities.mayCreate('note') && (
          <NewNoteIcon
            title={_('Add new Note')}
            value={entity}
            onClick={onNoteCreateClick}
          />
        )}
        {capabilities.mayCreate('override') && (
          <NewOverrideIcon
            title={_('Add new Override')}
            value={entity}
            onClick={onOverrideCreateClick}
          />
        )}
      </IconDivider>

      <IconDivider>
        {capabilities.mayAccess('results') && (
          <Link to="results" filter={'nvt=' + entity.id}>
            <ResultIcon title={_('Corresponding Results')} />
          </Link>
        )}
        {capabilities.mayAccess('vulns') && (
          <Link to="vulnerabilities" filter={'uuid=' + entity.id}>
            <VulnerabilityIcon title={_('Corresponding Vulnerabilities')} />
          </Link>
        )}
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

const Details = ({entity, notes = [], overrides = []}) => {
  overrides = overrides.filter(override => override.isActive());
  notes = notes.filter(note => note.isActive());

  return (
    <Layout flex="column">
      <NvtDetails entity={entity} />

      {overrides.length > 0 && (
        <DetailsBlock id="overrides" title={_('Overrides')}>
          <Divider wrap align={['start', 'stretch']} width="15px">
            {overrides.map(override => (
              <Override key={override.id} override={override} />
            ))}
          </Divider>
        </DetailsBlock>
      )}

      {notes.length > 0 && (
        <DetailsBlock id="notes" title={_('Notes')}>
          <Divider wrap align={['start', 'stretch']} width="15px">
            {notes.map(note => (
              <Note key={note.id} note={note} />
            ))}
          </Divider>
        </DetailsBlock>
      )}
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
  notes,
  overrides,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const defaultTimeout = isDefined(entity) ? entity.defaultTimeout : undefined;
  const preferences = isDefined(entity) ? entity.preferences : [];
  const userTags = isDefined(entity) ? entity.userTags : undefined;
  const numPreferences = preferences.length;

  return (
    <NvtComponent
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={onInteraction}
    >
      {({notecreate, overridecreate, download}) => (
        <EntityPage
          {...props}
          entity={entity}
          toolBarIcons={ToolBarIcons}
          title={_('NVT')}
          sectionIcon={<NvtIcon size="large" />}
          onChanged={onChanged}
          onInteraction={onInteraction}
          onNoteCreateClick={nvt => open_dialog(nvt, notecreate)}
          onNvtDownloadClick={download}
          onOverrideCreateClick={nvt => open_dialog(nvt, overridecreate)}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('NVT: {{name}}', {name: entity.name})} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab count={numPreferences}>
                        {_('Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <Details
                          notes={notes}
                          overrides={overrides}
                          entity={entity}
                        />
                      </TabPanel>
                      <TabPanel>
                        <Preferences
                          preferences={preferences}
                          defaultTimeout={defaultTimeout}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
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
    </NvtComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  notes: PropTypes.array,
  overrides: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const nvtIdFilter = id => Filter.fromString('nvt_id=' + id).all();

const mapStateToProps = (rootState, {id}) => {
  const notesSel = notesSelector(rootState);
  const overridesSel = overridesSelector(rootState);
  return {
    notes: notesSel.getEntities(nvtIdFilter(id)),
    overrides: overridesSel.getEntities(nvtIdFilter(id)),
  };
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadNotesFunc = loadNotes(gmp);
  const loadOverridesFunc = loadOverrides(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadNotesFunc(nvtIdFilter(id))),
      dispatch(loadOverridesFunc(nvtIdFilter(id))),
    ]);
};

export default withEntityContainer('nvt', {
  load,
  entitySelector: nvtsSelector,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
