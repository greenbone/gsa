/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {getTranslatableTicketStatus} from 'gmp/models/ticket';
import React from 'react';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import SolutionType from 'web/components/icon/SolutionTypeIcon';
import TicketIcon from 'web/components/icon/TicketIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TableBody from 'web/components/table/Body';
import Col from 'web/components/table/Col';
import TableData from 'web/components/table/Data';
import InfoTable from 'web/components/table/InfoTable';
import TableRow from 'web/components/table/Row';
import EntityPage from 'web/entity/EntityPage';
import EntityCloneIcon from 'web/entity/icon/CloneIcon';
import EntityEditIcon from 'web/entity/icon/EditIcon';
import EntityTrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import TicketComponent from 'web/pages/tickets/Component';
import TicketDetails from 'web/pages/tickets/Details';
import {
  selector as ticketSelector,
  loadEntity as loadTicket,
} from 'web/store/entities/tickets';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = ({
  entity,
  onTicketCloneClick,
  onTicketDeleteClick,
  onTicketDownloadClick,
  onTicketEditClick,
}) => (
  <Divider margin="10px">
    <ManualIcon
      anchor="managing-tickets"
      page="reports"
      title={_('Help: Remediation Tickets')}
    />
    <ListIcon page="tickets" title={_('Ticket List')} />
    <IconDivider>
      <EntityCloneIcon
        entity={entity}
        name="ticket"
        onClick={onTicketCloneClick}
      />
      <EntityEditIcon
        entity={entity}
        name="ticket"
        onClick={onTicketEditClick}
      />
      <EntityTrashIcon
        entity={entity}
        name="ticket"
        onClick={onTicketDeleteClick}
      />
      <ExportIcon
        title={_('Export Ticket as XML')}
        value={entity}
        onClick={onTicketDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTicketCloneClick: PropTypes.func.isRequired,
  onTicketDeleteClick: PropTypes.func.isRequired,
  onTicketDownloadClick: PropTypes.func.isRequired,
  onTicketEditClick: PropTypes.func.isRequired,
};

const Details = ({entity}) => (
  <Layout flex="column">
    <InfoTable>
      <colgroup>
        <Col width="10%" />
        <Col width="90%" />
      </colgroup>
      <TableBody>
        <TableRow>
          <TableData>{_('Name')}</TableData>
          <TableData>{entity.name}</TableData>
        </TableRow>
        <TableRow>
          <TableData>
            <Comment>{_('Comment')}</Comment>
          </TableData>
          <TableData>{entity.comment}</TableData>
        </TableRow>
        <TableRow>
          <TableData>{_('Severity')}</TableData>
          <TableData>
            <SeverityBar severity={entity.severity} />
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>{_('Status')}</TableData>
          <TableData>{getTranslatableTicketStatus(entity.status)}</TableData>
        </TableRow>
        <TableRow>
          <TableData>{_('Assigned To')}</TableData>
          <TableData>
            <span>
              <DetailsLink id={entity.assignedTo.user.id} type="user">
                {entity.assignedTo.user.name}
              </DetailsLink>
            </span>
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>{_('Solution Type')}</TableData>
          <TableData>
            <SolutionType displayTitleText type={entity.solutionType} />
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>{_('Host')}</TableData>
          <TableData>{entity.host}</TableData>
        </TableRow>
        <TableRow>
          <TableData>{_('Location')}</TableData>
          <TableData>{entity.location}</TableData>
        </TableRow>
      </TableBody>
    </InfoTable>
    <TicketDetails entity={entity} />
  </Layout>
);

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <TicketComponent
    onCloneError={onError}
    onCloned={goToDetails('ticket', props)}
    onDeleteError={onError}
    onDeleted={goToList('tickets', props)}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, close, delete: deleteFunc, download, edit, solve}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<TicketIcon size="large" />}
        title={_('Ticket')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onError={onError}
        onInteraction={onInteraction}
        onTicketCloneClick={clone}
        onTicketCloseClick={close}
        onTicketDeleteClick={deleteFunc}
        onTicketDownloadClick={download}
        onTicketEditClick={edit}
        onTicketSolveClick={solve}
      >
        {({activeTab = 0, onActivateTab}) => (
          <React.Fragment>
            <PageTitle title={_('Ticket: {{name}}', {name: entity.name})} />
            <Layout flex="column" grow="1">
              <TabLayout align={['start', 'end']} grow="1">
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
        )}
      </EntityPage>
    )}
  </TicketComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('ticket', {
  load: loadTicket,
  entitySelector: ticketSelector,
})(Page);
