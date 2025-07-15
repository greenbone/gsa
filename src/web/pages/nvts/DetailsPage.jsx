/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {
  NewNoteIcon,
  NvtIcon,
  ResultIcon,
  VulnerabilityIcon,
  NewOverrideIcon,
} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Link from 'web/components/link/Link';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import DetailsBlock from 'web/entity/Block';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import Note from 'web/entity/Note';
import Override from 'web/entity/Override';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import NvtComponent from 'web/pages/nvts/Component';
import NvtDetails from 'web/pages/nvts/Details';
import Preferences from 'web/pages/nvts/Preferences';
import {
  selector as notesSelector,
  loadEntities as loadNotes,
} from 'web/store/entities/notes';
import {selector as nvtsSelector, loadEntity} from 'web/store/entities/nvts';
import {
  selector as overridesSelector,
  loadEntities as loadOverrides,
} from 'web/store/entities/overrides';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
export let ToolBarIcons = ({
  capabilities,
  entity,
  onNoteCreateClick,
  onNvtDownloadClick,
  onOverrideCreateClick,
}) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="vulnerability-tests-vt"
          page="managing-secinfo"
          title={_('Help: NVTs')}
        />
        <ListIcon page="nvts" title={_('NVT List')} />
      </IconDivider>

      <ExportIcon
        title={_('Export NVT')}
        value={entity}
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
          <Link filter={'nvt=' + entity.id} to="results">
            <ResultIcon title={_('Corresponding Results')} />
          </Link>
        )}
        {capabilities.mayAccess('vulns') && (
          <Link filter={'uuid=' + entity.id} to="vulnerabilities">
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
  const [_] = useTranslation();
  overrides = overrides.filter(override => override.isActive());
  notes = notes.filter(note => note.isActive());

  return (
    <Layout flex="column">
      <NvtDetails entity={entity} />
      {overrides.length > 0 && (
        <DetailsBlock id="overrides" title={_('Overrides')}>
          <Divider wrap align={['start', 'stretch']} width="15px">
            {overrides.map(override => {
              return <Override key={override.id} override={override} />;
            })}
          </Divider>
        </DetailsBlock>
      )}
      {notes.length > 0 && (
        <DetailsBlock id="notes" title={_('Notes')}>
          <Divider wrap align={['start', 'stretch']} width="15px">
            {notes.map(note => {
              return <Note key={note.id} note={note} />;
            })}
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
  const [_] = useTranslation();
  const defaultTimeout = isDefined(entity) ? entity.defaultTimeout : undefined;
  const preferences = isDefined(entity) ? entity.preferences : [];
  const userTags = isDefined(entity) ? entity.userTags : undefined;
  const numPreferences = preferences.length;

  return (
    <NvtComponent
      onChanged={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
    >
      {({notecreate, overridecreate, download}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<NvtIcon size="large" />}
          title={_('NVT')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onInteraction={onInteraction}
          onNoteCreateClick={nvt => open_dialog(nvt, notecreate)}
          onNvtDownloadClick={download}
          onOverrideCreateClick={nvt => open_dialog(nvt, overridecreate)}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle title={_('NVT: {{name}}', {name: entity.name})} />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab count={numPreferences}>
                        {_('Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs>
                    <TabPanels>
                      <TabPanel>
                        <Details
                          entity={entity}
                          notes={notes}
                          overrides={overrides}
                        />
                      </TabPanel>
                      <TabPanel>
                        <Preferences
                          defaultTimeout={defaultTimeout}
                          preferences={preferences}
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
                </TabsContainer>
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
