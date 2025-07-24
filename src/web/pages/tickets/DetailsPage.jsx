/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {getTranslatableTicketStatus} from 'gmp/models/ticket';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import {TicketIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import SolutionType from 'web/components/icon/SolutionTypeIcon';
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
import TabsContainer from 'web/components/tab/TabsContainer';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import EntityCloneIcon from 'web/entity/icon/CloneIcon';
import EntityEditIcon from 'web/entity/icon/EditIcon';
import EntityTrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import TicketDetails from 'web/pages/tickets/Details';
import TicketComponent from 'web/pages/tickets/TicketComponent';
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
}) => {
  const [_] = useTranslation();

  return (
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
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTicketCloneClick: PropTypes.func.isRequired,
  onTicketDeleteClick: PropTypes.func.isRequired,
  onTicketDownloadClick: PropTypes.func.isRequired,
  onTicketEditClick: PropTypes.func.isRequired,
};

const Details = ({entity}) => {
  const [_] = useTranslation();

  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
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
                <DetailsLink id={entity.assignedTo.id} type="user">
                  {entity.assignedTo.name}
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
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  onChanged,
  onDownloaded,
  onError,

  ...props
}) => {
  const [_] = useTranslation();

  return (
    <TicketComponent
      onCloneError={onError}
      onCloned={goToDetails('ticket', props)}
      onDeleteError={onError}
      onDeleted={goToList('tickets', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
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
          onTicketCloneClick={clone}
          onTicketCloseClick={close}
          onTicketDeleteClick={deleteFunc}
          onTicketDownloadClick={download}
          onTicketEditClick={edit}
          onTicketSolveClick={solve}
        >
          {() => (
            <React.Fragment>
              <PageTitle title={_('Ticket: {{name}}', {name: entity.name})} />
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
            </React.Fragment>
          )}
        </EntityPage>
      )}
    </TicketComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntityContainer('ticket', {
  load: loadTicket,
  entitySelector: ticketSelector,
})(Page);
