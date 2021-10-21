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

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import DateTime from 'web/components/date/datetime';

import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import OvalDefIcon from 'web/components/icon/ovaldeficon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DetailsLink from 'web/components/link/detailslink';
import ExternalLink from 'web/components/link/externallink';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import EntityPage from 'web/entity/page';
import EntityComponent from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer from 'web/entity/withEntityContainer';

import {selector, loadEntity} from 'web/store/entities/ovaldefs';

import PropTypes from 'web/utils/proptypes';

import OvaldefDetails from './details';

const ToolBarIcons = ({entity, onOvaldefDownloadClick}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="managing-secinfo"
        anchor="oval-definitions"
        title={_('Help: OVAL Definitions')}
      />
      <ListIcon title={_('OVAL Definitions List')} page="ovaldefs" />
    </IconDivider>
    <ExportIcon
      value={entity}
      title={_('Export OVAL Definition')}
      onClick={onOvaldefDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onOvaldefDownloadClick: PropTypes.func.isRequired,
};

const Criteria = ({criteria}) => {
  const {
    criterions,
    criterias: subcriterias,
    extendDefinitions,
    operator,
    comment,
    negate,
  } = criteria;
  return (
    <li>
      <Divider>
        {isDefined(operator) && <b>{operator}</b>}
        {negate && <b>NOT</b>}
        {isDefined(comment) && <span>({comment})</span>}
      </Divider>
      <ul>
        {criterions.map((criterion, i) => (
          <li key={i}>
            <Divider>
              {criterion.negate && <b>NOT</b>}
              <span>{criterion.comment}</span>
              <i>({criterion.testRef})</i>
            </Divider>
          </li>
        ))}
        {extendDefinitions.map((extend_definition, i) => (
          <li key={i}>
            <Divider>
              {extend_definition.negate && <b>NOT</b>}
              <span>{extend_definition.comment}</span>
              <i>({extend_definition.definitionRef})</i>
            </Divider>
          </li>
        ))}
        {subcriterias.map((subcriteria, i) => (
          <Criteria key={i} criteria={subcriteria} />
        ))}
      </ul>
    </li>
  );
};

Criteria.propTypes = {
  criteria: PropTypes.object.isRequired,
};

const StyledDivider = styled(Divider)`
  margin-bottom: 1em;
`;

const Details = ({entity}) => {
  const {affecteds, criterias, references, repository} = entity;
  return (
    <Layout flex="column">
      <OvaldefDetails entity={entity} />

      <h2>{_('Affected')}</h2>
      {affecteds.length === 0 ? (
        <p>{_('None')}</p>
      ) : (
        affecteds.map(affected => (
          <div key={affected.family}>
            <h3>{_('Family {{family}}', affected)}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{_('Type')}</TableHead>
                  <TableHead>{_('Name')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affected.products.map(product => (
                  <TableRow key={product}>
                    <TableData>{_('Product')}</TableData>
                    <TableData>{product}</TableData>
                  </TableRow>
                ))}
                {affected.platforms.map(platform => (
                  <TableRow key={platform}>
                    <TableData>{_('Platform')}</TableData>
                    <TableData>{platform}</TableData>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))
      )}

      <h2>{_('Criteria')}</h2>
      {criterias.length === 0 ? (
        <p>{_('None')}</p>
      ) : (
        <ul>
          {criterias.map((criteria, i) => (
            <Criteria key={i} criteria={criteria} />
          ))}
        </ul>
      )}

      <h2>{_('References')}</h2>
      {references.length === 0 ? (
        <p>{_('None')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Source')}</TableHead>
              <TableHead>{_('Reference ID')}</TableHead>
              <TableHead>{_('URL')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {references.map(ref => (
              <TableRow key={ref.id}>
                <TableData>{ref.source}</TableData>
                <TableData>
                  <span>
                    <DetailsLink type={ref.type} id={ref.id}>
                      {ref.id}
                    </DetailsLink>
                  </span>
                </TableData>
                <TableData>
                  {isDefined(ref.url) && (
                    <span>
                      <ExternalLink to={ref.url}>{ref.url}</ExternalLink>
                    </span>
                  )}
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <h2>{_('Repository History')}</h2>
      {isDefined(repository) ? (
        <div>
          <StyledDivider>
            <b>{_('Status')}</b>
            <span>{repository.status}</span>
          </StyledDivider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{_('Status')}</TableHead>
                <TableHead>{_('Date')}</TableHead>
                <TableHead>{_('Contributors')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repository.changes.map(change => (
                <TableRow key={change.name}>
                  <TableData>
                    <Divider>
                      <span>{change.name}</span>
                      {isDefined(change.description) && (
                        <span>
                          (<i>{change.description}</i>)
                        </span>
                      )}
                    </Divider>
                  </TableData>
                  <TableData>
                    <DateTime date={change.date} />
                  </TableData>
                  <TableData>
                    <Divider>
                      {change.contributors.map(contributor => (
                        <Divider key={contributor.name}>
                          <span>{contributor.name}</span>
                          {isDefined(contributor.organization) && (
                            <span>
                              (<i>{contributor.organization}</i>)
                            </span>
                          )}
                        </Divider>
                      ))}
                    </Divider>
                  </TableData>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p>{_('None')}</p>
      )}
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const OvaldefPage = ({
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <EntityComponent
    name="ovaldef"
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
  >
    {({download}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<OvalDefIcon size="large" />}
        title={_('OVAL Definition')}
        toolBarIcons={ToolBarIcons}
        onInteraction={onInteraction}
        onOvaldefDownloadClick={download}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle
                title={_('OVAL Definition: {{title}}', {title: entity.title})}
              />
              <Layout grow="1" flex="column">
                <TabLayout grow="1" align={['start', 'end']}>
                  <TabList
                    active={activeTab}
                    align={['start', 'stretch']}
                    onActivateTab={onActivateTab}
                  >
                    <Tab>{_('Information')}</Tab>
                    <EntitiesTab entities={entity.userTags}>
                      {_('User Tags')}
                    </EntitiesTab>
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <Details entity={entity} />
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
  </EntityComponent>
);

OvaldefPage.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('ovaldef', {
  load: loadEntity,
  entitySelector: selector,
})(OvaldefPage);

// vim: set ts=2 sw=2 tw=80:
