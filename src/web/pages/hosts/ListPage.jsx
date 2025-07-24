/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useNavigate} from 'react-router';
import Filter, {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {HostIcon, NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import {goToDetails} from 'web/entity/navigation';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import HostsDashboard, {HOSTS_DASHBOARD_ID} from 'web/pages/hosts/dashboard';
import HostsFilterDialog from 'web/pages/hosts/FilterDialog';
import HostComponent from 'web/pages/hosts/HostComponent';
import HostsTable from 'web/pages/hosts/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/hosts';
import PropTypes from 'web/utils/PropTypes';

export const ToolBarIcons = ({onHostCreateClick}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-hosts"
        page="managing-assets"
        title={_('Help: Hosts')}
      />
      {capabilities.mayCreate('host') && (
        <NewIcon title={_('New Host')} onClick={onHostCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onHostCreateClick: PropTypes.func.isRequired,
};

const Page = ({
  entitiesCounts,
  filter,
  onChanged,
  onDownloaded,
  onError,
  onFilterChanged,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();
  const navigate = useNavigate();

  return (
    <HostComponent
      entitiesCounts={entitiesCounts}
      onCreated={onChanged}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
      onTargetCreateError={onError}
      onTargetCreated={goToDetails('target', navigate)}
    >
      {({
        create,
        createtargetfromselection,
        createtargetfromhost,
        delete: delete_func,
        download,
        edit,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Hosts')} />
          <EntitiesPage
            {...props}
            dashboard={() => (
              <HostsDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
                onInteraction={onInteraction}
              />
            )}
            dashboardControls={() => (
              <DashboardControls
                dashboardId={HOSTS_DASHBOARD_ID}
                onInteraction={onInteraction}
              />
            )}
            entitiesCounts={entitiesCounts}
            filter={filter}
            filterEditDialog={HostsFilterDialog}
            filtersFilter={HOSTS_FILTER_FILTER}
            sectionIcon={<HostIcon size="large" />}
            table={HostsTable}
            title={_('Hosts')}
            toolBarIcons={ToolBarIcons}
            onError={onError}
            onFilterChanged={onFilterChanged}
            onHostCreateClick={create}
            onHostDeleteClick={delete_func}
            onHostDownloadClick={download}
            onHostEditClick={edit}
            onInteraction={onInteraction}
            onTargetCreateFromHostClick={createtargetfromhost}
            onTargetCreateFromSelection={createtargetfromselection}
          />
        </React.Fragment>
      )}
    </HostComponent>
  );
};

Page.propTypes = {
  entitiesCounts: PropTypes.counts,
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const FALLBACK_HOSTS_LIST_FILTER = Filter.fromString(
  'sort-reverse=severity first=1',
);

export default withEntitiesContainer('host', {
  fallbackFilter: FALLBACK_HOSTS_LIST_FILTER,
  entitiesSelector,
  loadEntities,
})(Page);
