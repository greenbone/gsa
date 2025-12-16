/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {NvtIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import DetailsBlock from 'web/entity/DetailsBlock';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import Note from 'web/entity/NoteBox';
import Override from 'web/entity/OverrideBox';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import NvtComponent from 'web/pages/nvts/Component';
import NvtDetails from 'web/pages/nvts/NvtDetails';
import NvtDetailsPageToolBarIcons from 'web/pages/nvts/NvtDetailsPageToolBarIcons';
import NvtPreferences from 'web/pages/nvts/NvtPreferences';
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
    >
      {({notecreate, overridecreate, download}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<NvtIcon size="large" />}
          title={_('NVT')}
          toolBarIcons={NvtDetailsPageToolBarIcons}
          onChanged={onChanged}
          onNoteCreateClick={nvt => open_dialog(nvt, notecreate)}
          onNvtDownloadClick={download}
          onOverrideCreateClick={nvt => open_dialog(nvt, overridecreate)}
        >
          {() => {
            return (
              <>
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
                        <NvtPreferences
                          defaultTimeout={defaultTimeout}
                          preferences={preferences}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
                          onError={onError}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabsContainer>
              </>
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
