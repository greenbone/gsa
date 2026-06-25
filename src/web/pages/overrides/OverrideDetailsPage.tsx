/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate} from 'react-router';
import type Gmp from 'gmp/gmp';
import type Override from 'gmp/models/override';
import type Permission from 'gmp/models/permission';
import {isDefined} from 'gmp/utils/identity';
import {OverrideIcon} from 'web/components/icon';
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
import EntityPermissions from 'web/entity/EntityPermissions';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import useUserTimezone from 'web/hooks/useUserTimezone';
import OverrideComponent from 'web/pages/overrides/OverrideComponent';
import OverrideDetails from 'web/pages/overrides/OverrideDetails';
import OverrideDetailsPageToolBarIcons from 'web/pages/overrides/OverrideDetailsPageToolBarIcons';
import {
  selector as overridesSelector,
  loadEntity,
} from 'web/store/entities/overrides';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {renderYesNo} from 'web/utils/Render';
import {formattedUserSettingLongDate} from 'web/utils/user-setting-time-date-formatters';

interface DetailsProps {
  entity: Override;
}

interface OverrideDetailsPageProps {
  entity: Override;
  isLoading?: boolean;
  onChanged: () => void;
  onDownloaded: () => void;
  onError: (error: Error) => void;
  permissions?: Permission[];
}

const Details = ({entity}: DetailsProps) => {
  const [_] = useTranslation();
  const [timezone] = useUserTimezone();
  const {nvt} = entity;
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('NVT Name')}</TableData>
            <TableData>
              {isDefined(nvt) ? (
                <span>
                  <DetailsLink id={nvt.id as string} type="nvt">
                    {nvt.name}
                  </DetailsLink>
                </span>
              ) : (
                _('None. Result was an open port.')
              )}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('NVT OID')}</TableData>
            <TableData>{nvt?.id}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Active')}</TableData>
            <TableData>
              {renderYesNo(entity.isActive())}
              {entity.isActive() &&
                isDefined(entity.endTime) &&
                ' ' +
                  _('until {{- endDate}}', {
                    endDate: formattedUserSettingLongDate(
                      entity.endTime,
                      timezone,
                    ) as string,
                  })}
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
      <OverrideDetails entity={entity} />
    </Layout>
  );
};

const OverrideDetailsPage = ({
  entity,
  isLoading = false,
  permissions = [],
  onError,
  onChanged,
  onDownloaded,
  ...props
}: OverrideDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <OverrideComponent
      onCloneError={onError}
      onCloned={goToDetails('override', navigate)}
      onCreated={goToDetails('override', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('overrides', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <>
          <PageTitle title={_('Override Details')} />
          <EntityPage
            {...props}
            entity={entity}
            isLoading={isLoading}
            sectionIcon={<OverrideIcon size="large" />}
            title={_('Override')}
            toolBarIcons={
              <OverrideDetailsPageToolBarIcons
                entity={entity}
                onOverrideCloneClick={clone}
                onOverrideCreateClick={create}
                onOverrideDeleteClick={deleteFunc}
                onOverrideDownloadClick={download}
                onOverrideEditClick={edit}
              />
            }
          >
            {() => {
              return (
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
              );
            }}
          </EntityPage>
        </>
      )}
    </OverrideComponent>
  );
};

const load = (gmp: Gmp) => {
  const loadOverride = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return (id: string) => dispatch =>
    Promise.all([
      dispatch(loadOverride(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState: unknown, {id}: {id: string}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('override', {
  entitySelector: overridesSelector,
  load,
  mapStateToProps,
})(OverrideDetailsPage);
