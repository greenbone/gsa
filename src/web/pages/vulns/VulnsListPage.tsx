/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type FilterType, VULNS_FILTER_FILTER} from 'gmp/models/filter';
import type Vulnerability from 'gmp/models/vulnerability';
import {getEntityType, pluralizeType} from 'gmp/utils/entity-type';
import DashboardControls from 'web/components/dashboard/Controls';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {VulnerabilityIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import SubscriptionProvider from 'web/components/provider/SubscriptionProvider';
import EntitiesPage from 'web/entities/EntitiesPage';
import {
  useBulkDeleteVulns,
  useBulkExportVulns,
  useGetVulnerabilities,
} from 'web/hooks/use-query/vulns';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import VulnerabilitiesDashboard, {
  VULNS_DASHBOARD_ID,
} from 'web/pages/vulns/dashboard';
import VulnerabilityFilterDialog from 'web/pages/vulns/VulnsFilterDialog';
import VulnsTable from 'web/pages/vulns/VulnsTable';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {generateFilename} from 'web/utils/Render';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';

type BulkInput = Vulnerability[] | FilterType;

function resolveBulkInput(
  selectionType: SelectionTypeType,
  selectedEntities: Vulnerability[],
  filter: FilterType,
  allEntities: Vulnerability[],
): BulkInput {
  if (selectionType === SelectionType.SELECTION_USER) {
    return selectedEntities;
  }
  if (selectionType === SelectionType.SELECTION_FILTER) {
    return filter.all();
  }
  return allEntities;
}

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

const VulnsPage = () => {
  const [_] = useTranslation();

  const [downloadRef, handleDownload] = useDownload();

  const listExportFileName = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).getValueByName('listexportfilename'),
  );

  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const [filter, isFilterLoading, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('vulnerability', 'vulnerability');

  const {
    data: vulnsData,
    isLoading: isDataLoading,
    isFetching: isUpdating,
    error,
    isError,
  } = useGetVulnerabilities({filter});

  const allEntities = useMemo(() => vulnsData?.entities ?? [], [vulnsData]);
  const entitiesCounts = vulnsData?.entitiesCounts;

  const {
    selectionType,
    selected: selectedEntities = [],
    changeSelectionType,
    select,
    deselect,
  } = useSelection<Vulnerability>();
  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );
  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts as CollectionCounts,
    changeFilter,
  );

  const bulkDelete = useBulkDeleteVulns({onError: showError});
  const bulkExport = useBulkExportVulns({onError: showError});

  const handleBulkDelete = useCallback(async () => {
    const input = resolveBulkInput(
      selectionType,
      selectedEntities,
      filter,
      allEntities,
    );
    try {
      await bulkDelete.mutateAsync(input);
    } catch (e) {
      showError(e as Error);
    }
  }, [
    selectionType,
    selectedEntities,
    filter,
    allEntities,
    bulkDelete,
    showError,
  ]);

  const handleBulkDownload = useCallback(async () => {
    const input = resolveBulkInput(
      selectionType,
      selectedEntities,
      filter,
      allEntities,
    );
    try {
      showSuccessNotification('', _('Bulk download started.'));
      const response = await bulkExport.mutateAsync(input);
      const filename = generateFilename({
        fileNameFormat: listExportFileName,
        resourceType: pluralizeType(getEntityType(allEntities[0])),
      });
      const {data} = response;
      handleDownload({filename, data});
      showSuccessNotification('', _('Bulk download completed.'));
    } catch (e) {
      showError(e as Error);
    }
  }, [
    selectionType,
    selectedEntities,
    filter,
    allEntities,
    bulkExport,
    showError,
    handleDownload,
    listExportFileName,
    _,
  ]);

  const isLoading = isFilterLoading || isDataLoading;

  return (
    <>
      <PageTitle title={_('Vulnerabilities')} />
      <EntitiesPage<Vulnerability>
        createFilterType="vulnerability"
        dashboard={() => (
          <SubscriptionProvider>
            {() => (
              <VulnerabilitiesDashboard
                filter={filter}
                onFilterChanged={changeFilter}
              />
            )}
          </SubscriptionProvider>
        )}
        dashboardControls={() => (
          <DashboardControls dashboardId={VULNS_DASHBOARD_ID} />
        )}
        entities={allEntities}
        entitiesCounts={entitiesCounts}
        entitiesError={isError ? error : undefined}
        filter={filter}
        filterEditDialog={VulnerabilityFilterDialog}
        filtersFilter={VULNS_FILTER_FILTER}
        isLoading={isLoading}
        sectionIcon={<VulnerabilityIcon size="large" />}
        table={
          <VulnsTable
            entities={allEntities}
            entitiesCounts={entitiesCounts}
            filter={filter}
            isUpdating={isUpdating}
            selectionType={selectionType}
            sortBy={sortBy}
            sortDir={sortDir}
            onDeleteBulk={handleBulkDelete}
            onDownloadBulk={handleBulkDownload}
            onEntityDeselected={deselect}
            onEntitySelected={select}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
          />
        }
        title={_('Vulnerabilities')}
        toolBarIcons={ToolBarIcons}
        onError={showError}
        onFilterChanged={changeFilter}
        onFilterCreated={changeFilter}
        onFilterRemoved={removeFilter}
        onFilterReset={resetFilter}
      />
      <Download ref={downloadRef} />
      <DialogNotification
        {...notificationDialogState}
        onCloseClick={closeNotificationDialog}
      />
    </>
  );
};

export default VulnsPage;
