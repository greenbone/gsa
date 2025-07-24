/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Badge from 'web/components/badge/Badge';
import SeverityBar from 'web/components/bar/SeverityBar';
import {HostIcon, OsSvgIcon} from 'web/components/icon';
import CpeIcon from 'web/components/icon/CpeIcon';
import DeleteIcon from 'web/components/icon/DeleteIcon';
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
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import {goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import OsComponent from 'web/pages/operatingsystems/Component';
import {
  selector as osSelector,
  loadEntity,
} from 'web/store/entities/operatingsystems';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = ({
  entity,
  links = true,
  onOperatingSystemDeleteClick,
  onOperatingSystemDownloadClick,
}) => {
  const [_] = useTranslation();
  const {allHosts, hosts} = entity;
  const capabilities = useCapabilities();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-operating-systems"
          page="managing-assets"
          title={_('Help: Operating Systems')}
        />
        <ListIcon page="operatingsystems" title={_('Operating System List')} />
      </IconDivider>
      <IconDivider>
        {capabilities.mayDelete('os') &&
          (entity.isInUse() ? (
            <DeleteIcon
              active={false}
              title={_('Operating System is in use')}
            />
          ) : (
            <DeleteIcon
              title={_('Delete')}
              value={entity}
              onClick={onOperatingSystemDeleteClick}
            />
          ))}
        <ExportIcon
          title={_('Export Operating System')}
          value={entity}
          onClick={onOperatingSystemDownloadClick}
        />
      </IconDivider>
      <IconDivider>
        <Badge content={allHosts}>
          <Link
            filter={'os_id="' + entity.id + '"'}
            textOnly={!links}
            title={_('Hosts with Operating System {{- name}}', entity)}
            to="hosts"
          >
            <HostIcon />
          </Link>
        </Badge>
      </IconDivider>
      <IconDivider>
        <Badge content={hosts}>
          <Link
            filter={'best_os_cpe="' + entity.name + '"'}
            textOnly={!links}
            title={_(
              'Hosts with Operating System {{- name}} as the best match',
              entity,
            )}
            to="hosts"
          >
            <HostIcon />
          </Link>
        </Badge>
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onOperatingSystemDeleteClick: PropTypes.func.isRequired,
  onOperatingSystemDownloadClick: PropTypes.func.isRequired,
};

const Details = ({entity}) => {
  const [_] = useTranslation();
  const {averageSeverity, highestSeverity, latestSeverity, name} = entity;
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
            <TableData>
              <IconDivider align={['start', 'center']}>
                <CpeIcon name={name} />
                <span>{name}</span>
              </IconDivider>
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Latest Severity')}</TableData>
            <TableData>
              <SeverityBar severity={latestSeverity} />
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Highest Severity')}</TableData>
            <TableData>
              <SeverityBar severity={highestSeverity} />
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Average Severity')}</TableData>
            <TableData>
              <SeverityBar severity={averageSeverity} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onDownloaded,
  onChanged,
  onError,

  ...props
}) => {
  const [_] = useTranslation();

  return (
    <OsComponent
      onDeleteError={onError}
      onDeleted={goToList('operatingsystems', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
    >
      {({delete: delete_func, download}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<OsSvgIcon size="large" />}
          title={_('Operating System')}
          toolBarIcons={ToolBarIcons}
          onOperatingSystemDeleteClick={delete_func}
          onOperatingSystemDownloadClick={download}
          onPermissionChanged={onChanged}
          onPermissionDownloadError={onError}
          onPermissionDownloaded={onDownloaded}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Operating System: {{name}}', {name: entity.name})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
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
                      <TabPanel>
                        <EntityPermissions
                          entity={entity}
                          permissions={permissions}
                          onChanged={onChanged}
                          onDownloaded={onDownloaded}
                          onError={onError}
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
    </OsComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('operatingsystem', {
  entitySelector: osSelector,
  load,
  mapStateToProps,
})(Page);
