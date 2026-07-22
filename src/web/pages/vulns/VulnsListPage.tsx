/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {VULNS_FILTER_FILTER} from 'gmp/models/filter';
import type Vulnerability from 'gmp/models/vulnerability';
import DashboardControls from 'web/components/dashboard/Controls';
import {VulnerabilityIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import VulnerabilitiesDashboard, {
  VULNS_DASHBOARD_ID,
} from 'web/pages/vulns/dashboard';
import VulnerabilityFilterDialog from 'web/pages/vulns/VulnsFilterDialog';
import VulnsTable from 'web/pages/vulns/VulnsTable';
import {
  selector as entitiesSelector,
  loadEntities,
} from 'web/store/entities/vulns';

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <Layout>
      <ManualIcon
        anchor="displaying-all-existing-vulnerabilities"
        page="reports"
        title={_('Vulnerabilities')}
      />
    </Layout>
  );
};

const VulnsListPage = ({
  entities,
  entitiesCounts,
  entitiesError,
  filter,
  isLoading,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
}: WithEntitiesContainerComponentProps<Vulnerability>) => {
  const [_] = useTranslation();
  return (
    <>
      <PageTitle title={_('Vulnerabilities')} />
      <EntitiesPage<Vulnerability>
        createFilterType="vulnerability"
        dashboard={() => (
          <VulnerabilitiesDashboard
            filter={filter}
            onFilterChanged={onFilterChanged}
          />
        )}
        dashboardControls={() => (
          <DashboardControls dashboardId={VULNS_DASHBOARD_ID} />
        )}
        entities={entities}
        entitiesCounts={entitiesCounts}
        entitiesError={entitiesError}
        filter={filter}
        filterEditDialog={VulnerabilityFilterDialog}
        filtersFilter={VULNS_FILTER_FILTER}
        isLoading={isLoading}
        sectionIcon={<VulnerabilityIcon size="large" />}
        table={VulnsTable}
        title={_('Vulnerabilities')}
        toolBarIcons={ToolBarIcons}
        onError={onError}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
        onFilterRemoved={onFilterRemoved}
        onFilterReset={onFilterReset}
      />
    </>
  );
};

export default withEntitiesContainer<Vulnerability>('vulnerability', {
  entitiesSelector,
  loadEntities,
})(VulnsListPage);
