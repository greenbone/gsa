/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {connect} from 'react-redux';
import {MANUAL, TASK_SELECTED, RESULT_ANY} from 'gmp/models/override';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import {OverrideIcon, ResultIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import CveLink from 'web/components/link/CveLink';
import DetailsLink from 'web/components/link/DetailsLink';
import InnerLink from 'web/components/link/InnerLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/DetailsBlock';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import {goToDetails} from 'web/entity/navigation';
import NoteBox from 'web/entity/NoteBox';
import OverrideBox from 'web/entity/OverrideBox';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import NoteComponent from 'web/pages/notes/NoteComponent';
import OverrideComponent from 'web/pages/overrides/OverrideComponent';
import ResultDetails from 'web/pages/results/ResultDetails';
import ResultDetailsPageToolBarIcons from 'web/pages/results/ResultDetailsPageToolBarIcons';
import TicketComponent from 'web/pages/tickets/TicketComponent';
import {loadEntity, selector} from 'web/store/entities/results';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import {renderPercentile, renderScore} from 'web/utils/severity';
import withTranslation from 'web/utils/withTranslation';

const activeFilter = entity => entity.isActive();

const ResultDetailsColGroup = () => (
  <colgroup>
    <TableCol width="10%" />
    <TableCol width="90%" />
  </colgroup>
);

const Details = ({entity, ...props}) => {
  const {notes, overrides, qod, host, userTags} = entity;
  const active_notes = notes.filter(activeFilter);
  const active_overrides = overrides.filter(activeFilter);
  const epss = entity?.information?.epss;
  const gmp = useGmp();
  const [_] = useTranslation();
  return (
    <>
      <PageTitle title={_('Result: {{name}}', {name: entity.name})} />
      <Layout flex="column">
        <DetailsBlock title={_('Vulnerability')}>
          <Layout flex="column">
            <InfoTable>
              <ResultDetailsColGroup />
              <TableBody>
                <TableRow>
                  <TableData>{_('Name')}</TableData>
                  <TableData>{entity.name}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Severity')}</TableData>
                  <TableData align={['center', 'start']}>
                    <Divider>
                      <SeverityBar severity={entity.severity} />
                      {active_overrides.length > 0 && (
                        <InnerLink to="overrides">
                          <OverrideIcon
                            title={_('There are overrides for this result')}
                          />
                        </InnerLink>
                      )}
                    </Divider>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('QoD')}</TableData>
                  <TableData>{qod.value} %</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Host')}</TableData>
                  <TableData>
                    <span>
                      {isDefined(host.id) ? (
                        <DetailsLink id={host.id} type="host">
                          {host.name}
                        </DetailsLink>
                      ) : (
                        host.name
                      )}
                    </span>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Location')}</TableData>
                  <TableData>{entity.port}</TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
            {gmp.settings.enableEPSS && isDefined(epss?.maxSeverity) && (
              <>
                <h3>{_('EPSS (CVE with highest severity)')}</h3>
                <InfoTable>
                  <ResultDetailsColGroup />
                  <TableBody>
                    <TableRow>
                      <TableData>{_('EPSS Score')}</TableData>
                      <TableData>
                        {renderScore(epss?.maxSeverity?.score)}
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>{_('EPSS Percentile')}</TableData>
                      <TableData>
                        {renderPercentile(epss?.maxSeverity?.percentile)}
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>{_('CVE')}</TableData>
                      <TableData>
                        <CveLink id={epss?.maxSeverity?.cve?.id}>
                          {epss?.maxSeverity?.cve?.id}
                        </CveLink>
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>{_('CVE Severity')}</TableData>
                      <TableData>
                        <SeverityBar
                          severity={
                            isDefined(epss?.maxSeverity?.cve?.severity)
                              ? epss?.maxSeverity?.cve?.severity
                              : _('N/A')
                          }
                        />
                      </TableData>
                    </TableRow>
                  </TableBody>
                </InfoTable>
              </>
            )}
            {gmp.settings.enableEPSS && isDefined(epss?.maxEpss) && (
              <>
                <h3>{_('EPSS (highest EPSS score)')}</h3>
                <InfoTable>
                  <ResultDetailsColGroup />
                  <TableBody>
                    <TableRow>
                      <TableData>{_('EPSS Score')}</TableData>
                      <TableData>{renderScore(epss?.maxEpss?.score)}</TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>{_('EPSS Percentile')}</TableData>
                      <TableData>
                        {renderPercentile(epss?.maxEpss?.percentile)}
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>{_('CVE')}</TableData>
                      <TableData>
                        <CveLink id={epss?.maxEpss?.cve?.id}>
                          {epss?.maxEpss?.cve?.id}
                        </CveLink>
                      </TableData>
                    </TableRow>
                    <TableRow>
                      <TableData>{_('CVE Severity')}</TableData>
                      <TableData>
                        <SeverityBar
                          severity={
                            isDefined(epss?.maxEpss?.cve?.severity)
                              ? epss?.maxEpss?.cve?.severity
                              : _('N/A')
                          }
                        />
                      </TableData>
                    </TableRow>
                  </TableBody>
                </InfoTable>
              </>
            )}
          </Layout>
        </DetailsBlock>

        {userTags.length > 0 && (
          <DetailsBlock title={_('Tags')}>
            <Divider>
              {userTags.map(tag => {
                const valueString = isDefined(tag.value) ? '' : '=' + tag.value;
                return (
                  <DetailsLink key={tag.id} id={tag.id} type="tag">
                    {tag.name + valueString}
                  </DetailsLink>
                );
              })}
            </Divider>
          </DetailsBlock>
        )}

        <ResultDetails entity={entity} {...props} />

        {active_overrides.length > 0 && (
          <DetailsBlock id="overrides" title={_('Overrides')}>
            <Divider wrap align={['start', 'stretch']} width="15px">
              {active_overrides.map(override => (
                <OverrideBox key={override.id} override={override} />
              ))}
            </Divider>
          </DetailsBlock>
        )}

        {active_notes.length > 0 && (
          <DetailsBlock id="notes" title={_('Notes')}>
            <Divider wrap align={['start', 'stretch']} width="15px">
              {active_notes.map(note => (
                <NoteBox key={note.id} note={note} />
              ))}
            </Divider>
          </DetailsBlock>
        )}
      </Layout>
    </>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

class Page extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDownload = this.handleDownload.bind(this);

    this.openDialog = this.openDialog.bind(this);
  }

  handleDownload(result) {
    const {gmp} = this.props;

    const {detailsExportFileName, username, onError, onDownloaded} = this.props;
    return gmp.result
      .export(result)
      .then(response => {
        const {creationTime, entityType, id, modificationTime, name} = result;
        const filename = generateFilename({
          creationTime: creationTime,
          fileNameFormat: detailsExportFileName,
          id: id,
          modificationTime,
          resourceName: name,
          resourceType: entityType,
          username,
        });
        return {filename, data: response.data};
      })
      .then(onDownloaded, onError);
  }

  openDialog(result = {}, createFunc) {
    const {information = {}, task = {}, host = {}} = result;
    createFunc({
      fixed: true,
      oid: information.id,
      nvt_name: information.name,
      task_id: TASK_SELECTED,
      task_name: task.name,
      result_id: RESULT_ANY,
      task_uuid: task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      hosts: MANUAL,
      hosts_manual: host.name,
      port: MANUAL,
      port_manual: result.port,
    });
  }

  render() {
    const {_} = this.props;

    const {entity, onChanged, onError} = this.props;
    return (
      <NoteComponent onCreated={onChanged}>
        {({create: createNote}) => (
          <OverrideComponent onCreated={onChanged}>
            {({create: createOverride}) => (
              <TicketComponent onCreated={goToDetails('ticket', this.props)}>
                {({createFromResult: createTicket}) => (
                  <EntityPage
                    {...this.props}
                    entity={entity}
                    sectionIcon={<ResultIcon size="large" />}
                    title={_('Result')}
                    toolBarIcons={ResultDetailsPageToolBarIcons}
                    onNoteCreateClick={result =>
                      this.openDialog(result, createNote)
                    }
                    onOverrideCreateClick={result =>
                      this.openDialog(result, createOverride)
                    }
                    onResultDownloadClick={this.handleDownload}
                    onTicketCreateClick={createTicket}
                  >
                    {() => (
                      <TabsContainer flex="column" grow="1">
                        <TabLayout align={['start', 'end']} grow="1">
                          <TabList align={['start', 'stretch']}>
                            <Tab>{_('Information')}</Tab>
                            <EntitiesTab entities={entity.userTags}>
                              {_('User Tags')}
                            </EntitiesTab>
                          </TabList>
                        </TabLayout>

                        <Tabs>
                          <TabPanels>
                            <TabPanel>
                              <Details entity={entity} />
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
                    )}
                  </EntityPage>
                )}
              </TicketComponent>
            )}
          </OverrideComponent>
        )}
      </NoteComponent>
    );
  }
}

Page.propTypes = {
  detailsExportFileName: PropTypes.string,
  entity: PropTypes.model,
  gmp: PropTypes.gmp.isRequired,
  username: PropTypes.string,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
};

const mapStateToProps = rootState => {
  const userDefaultsSelector = getUserSettingsDefaults(rootState);
  const username = getUsername(rootState);
  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );
  return {
    detailsExportFileName,
    username,
  };
};

const mapDispatchToProps = (dispatch, {gmp}) => ({
  loadSettings: () => dispatch(loadUserSettingDefaults(gmp)()),
});

export default compose(
  withTranslation,
  withEntityContainer('result', {
    entitySelector: selector,
    load: loadEntity,
  }),
  connect(mapStateToProps, mapDispatchToProps),
)(Page);
