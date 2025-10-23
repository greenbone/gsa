/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {
  showSuccessNotification,
  showErrorNotification,
} from '@greenbone/ui-lib';
import type CollectionCounts from 'gmp/collection/collection-counts';
import logger from 'gmp/log';
import type AgentInstaller from 'gmp/models/agent-installer';
import {AGENT_INSTALLERS_FILTER_FILTER} from 'gmp/models/filter';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {HatAndGlassesIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import {useGetAgentInstallers} from 'web/hooks/use-query/agent-installers';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useTranslation from 'web/hooks/useTranslation';
import AgentInstallersFilterDialog from 'web/pages/agent-installers/AgentInstallerFilterDialog';
import AgentInstallersListPageToolBarIcons from 'web/pages/agent-installers/AgentInstallerListPageToolBarIcons';
import AgentInstallerTable from 'web/pages/agent-installers/AgentInstallerTable';

const log = logger.getLogger(
  'web.pages.agent-installers.AgentInstallerListPage',
);

const AgentInstallerListPage = () => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const [agentInstallers, setAgentInstallers] = useState<AgentInstaller[]>([]);
  const [entitiesCounts, setEntitiesCounts] = useState<
    CollectionCounts | undefined
  >();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const [filter, isFilterLoading, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('agentinstallers', 'agentinstallers');
  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );
  const [downloadRef, handleDownload] = useDownload();
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const {
    selectionType,
    selected: selectedEntities = [],
    changeSelectionType,
    select,
    deselect,
  } = useSelection<AgentInstaller>();

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts as CollectionCounts,
    changeFilter,
  );

  const {
    data: agentInstallersData,
    isLoading,
    isFetching: isUpdating,
    error,
  } = useGetAgentInstallers({filter});

  useEffect(() => {
    setAgentInstallers(
      previousAgentInstallers =>
        agentInstallersData?.entities ?? previousAgentInstallers,
    );
    setEntitiesCounts(
      previousCounts => agentInstallersData?.entitiesCounts ?? previousCounts,
    );
  }, [agentInstallersData, setAgentInstallers, setEntitiesCounts]);

  const closeTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(false);
  }, [setIsTagsDialogVisible]);

  const openTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(true);
  }, [setIsTagsDialogVisible]);

  const handleDownloadInstaller = async (agentInstaller: AgentInstaller) => {
    const {id, name, fileExtension, version, contentType} = agentInstaller;
    const filename = `${name}-${version}.${fileExtension}`;
    try {
      const response = await gmp.agentinstaller.download(id as string);
      handleDownload({
        data: response.data,
        filename,
        mimetype: contentType,
      });
    } catch (error) {
      showError(error as Error);
    }
  };

  const handleCopyChecksum = async (agentInstaller: AgentInstaller) => {
    const {checksum, name, version} = agentInstaller;
    try {
      await navigator.clipboard.writeText(checksum as string);
      showSuccessNotification(
        _(
          'Checksum for agent installer {{name}} {{version}} copied to clipboard.',
          {name: name as string, version: version ?? ''},
        ),
      );
    } catch (error) {
      log.error(
        `Failed to copy checksum to clipboard for agent installer ${agentInstaller.id}`,
        error,
      );
      showErrorNotification(
        _(
          'Failed to copy checksum for agent installer {{name}} {{version}} to clipboard.',
          {name: name as string, version: version ?? ''},
        ),
      );
    }
  };
  return (
    <>
      <PageTitle title={_('Agent Installers')} />
      <EntitiesPage
        createFilterType="agentinstaller"
        entities={agentInstallers}
        entitiesCounts={entitiesCounts}
        entitiesError={error ?? undefined}
        filter={filter}
        filterEditDialog={AgentInstallersFilterDialog}
        filtersFilter={AGENT_INSTALLERS_FILTER_FILTER}
        isLoading={isLoading}
        isLoadingFilters={isFilterLoading}
        sectionIcon={<HatAndGlassesIcon size="large" />}
        table={
          <AgentInstallerTable
            entities={agentInstallers}
            entitiesCounts={entitiesCounts}
            filter={filter}
            isUpdating={isUpdating}
            selectionType={selectionType}
            sortBy={sortBy}
            sortDir={sortDir}
            onAgentInstallerChecksumClick={handleCopyChecksum}
            onAgentInstallerDownloadClick={handleDownloadInstaller}
            onEntityDeselected={deselect}
            onEntitySelected={select}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
            onTagsBulk={openTagsDialog}
          />
        }
        title={_('Agent Installers')}
        toolBarIcons={<AgentInstallersListPageToolBarIcons />}
        onError={() => {}}
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
      {isTagsDialogVisible && (
        <BulkTags<AgentInstaller>
          entities={agentInstallers}
          entitiesCounts={entitiesCounts as CollectionCounts}
          filter={filter}
          selectedEntities={selectedEntities}
          selectionType={selectionType}
          onClose={closeTagsDialog}
        />
      )}
    </>
  );
};

export default AgentInstallerListPage;
