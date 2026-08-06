/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router';
import {type EntityActionData} from 'gmp/commands/entity';
import {
  type default as Ticket,
  getTranslatableTicketStatus,
} from 'gmp/models/ticket';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {TicketIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import SolutionTypeIcon from 'web/components/icon/SolutionTypeIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
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
import CloneIcon from 'web/entity/icon/CloneIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import {useGetTicket} from 'web/hooks/use-query/tickets';
import useTranslation from 'web/hooks/useTranslation';
import TicketComponent from 'web/pages/tickets/TicketComponent';
import TicketDetails from 'web/pages/tickets/TicketDetails';

interface ToolBarIconsProps {
  entity: Ticket;
  onTicketCloneClick: (ticket: Ticket) => void | Promise<void>;
  onTicketDeleteClick: (ticket: Ticket) => void | Promise<void>;
  onTicketDownloadClick: (ticket: Ticket) => void | Promise<void>;
  onTicketEditClick: (ticket: Ticket) => void | Promise<void>;
}

interface DetailsProps {
  entity: Ticket;
}

const ToolBarIcons = ({
  entity,
  onTicketCloneClick,
  onTicketDeleteClick,
  onTicketDownloadClick,
  onTicketEditClick,
}: ToolBarIconsProps) => {
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
        <CloneIcon entity={entity} name="ticket" onClick={onTicketCloneClick} />
        <EditIcon entity={entity} name="ticket" onClick={onTicketEditClick} />
        <DeleteIcon
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

const Details = ({entity}: DetailsProps) => {
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
            <TableData>
              {entity.status
                ? getTranslatableTicketStatus(entity.status)
                : undefined}
            </TableData>
          </TableRow>
          <TableRow>
            <TableData>{_('Assigned To')}</TableData>
            <TableData>
              <span>
                <DetailsLink id={entity.assignedTo?.id as string} type="user">
                  {entity.assignedTo?.name as string}
                </DetailsLink>
              </span>
            </TableData>
          </TableRow>
          <TableRow>
            <TableData>{_('Solution Type')}</TableData>
            <TableData>
              <SolutionTypeIcon
                displayTitleText
                type={entity.solutionType as never}
              />
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

const TicketDetailsPage = () => {
  const [_] = useTranslation();
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();
  const {title: dialogTitle, message: dialogMessage} = dialogState;

  const {data: entity, error, isLoading} = useGetTicket({id: id ?? ''});

  const onChanged = () => {
    void queryClient.invalidateQueries({queryKey: ['get_ticket']});
  };

  const onError = (err: Error) => {
    showError(err);
  };

  const onDownloaded = handleDownload;

  const handleEntityActionCompleted = (response: EntityActionData) => {
    goToDetails('ticket', navigate)({data: {id: response.id}});
  };

  return (
    <>
      <DialogNotification
        message={dialogMessage}
        title={dialogTitle}
        onCloseClick={closeDialog}
      />
      <Download ref={downloadRef} />
      <TicketComponent
        onCloneError={onError}
        onCloned={handleEntityActionCompleted}
        onDeleteError={onError}
        onDeleted={goToList('tickets', navigate)}
        onDownloadError={onError}
        onDownloaded={onDownloaded}
        onSaved={onChanged}
      >
        {({clone, close, delete: deleteFunc, download, edit, solve}) => (
          <EntityPage<Ticket>
            entity={entity}
            entityError={
              error ? {status: 0, message: error.message} : undefined
            }
            entityType="ticket"
            isLoading={isLoading}
            sectionIcon={<TicketIcon size="large" />}
            title={_('Ticket')}
            toolBarIcons={
              <ToolBarIcons
                entity={entity as Ticket}
                onTicketCloneClick={clone}
                onTicketDeleteClick={deleteFunc}
                onTicketDownloadClick={download}
                onTicketEditClick={edit}
              />
            }
          >
            {entity => (
              <>
                <PageTitle
                  title={_('Ticket: {{name}}', {
                    name: entity.name as string,
                  })}
                />
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
              </>
            )}
          </EntityPage>
        )}
      </TicketComponent>
    </>
  );
};

export default TicketDetailsPage;
