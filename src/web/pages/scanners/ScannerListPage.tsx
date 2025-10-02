/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {SCANNERS_FILTER_FILTER} from 'gmp/models/filter';
import Scanner from 'gmp/models/scanner';
import {ScannerIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import ScannerComponent from 'web/pages/scanners/ScannerComponent';
import ScannerFilterDialog from 'web/pages/scanners/ScannerFilterDialog';
import ScannerListPageToolBarIcons from 'web/pages/scanners/ScannerListPageToolBarIcons';
import ScannerTable from 'web/pages/scanners/ScannerTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanners';

type ScannerListPageProps = WithEntitiesContainerComponentProps<Scanner>;

const ScannerListPage = ({
  entities,
  entitiesCounts,
  entitiesError,
  entitiesSelected,
  filter,
  isLoading,
  isUpdating,
  selectionType,
  sortBy,
  sortDir,
  onChanged,
  onDeleteBulk,
  onDownloadBulk,
  onDownloaded,
  onEntityDeselected,
  onEntitySelected,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
  onSelectionTypeChange,
  onSortChange,
  onTagsBulk,
  showSuccess,
}: ScannerListPageProps) => {
  const [_] = useTranslation();
  return (
    <ScannerComponent
      onCertificateDownloaded={onDownloaded}
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onCredentialDownloadError={onError}
      onCredentialDownloaded={onDownloaded}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
      onVerified={() => {
        onChanged();
        showSuccess(_('Scanner Verified'));
      }}
      onVerifyError={onError}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        downloadCertificate,
        downloadCredential,
        edit,
        verify,
      }) => (
        <>
          <PageTitle title={_('Scanners')} />
          <EntitiesPage<Scanner>
            createFilterType="scanner"
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            filter={filter}
            filterEditDialog={ScannerFilterDialog}
            filtersFilter={SCANNERS_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<ScannerIcon size="large" />}
            table={
              <ScannerTable
                entities={entities}
                entitiesCounts={entitiesCounts}
                filter={filter}
                isUpdating={isUpdating}
                selectionType={selectionType}
                sortBy={sortBy}
                sortDir={sortDir}
                onDeleteBulk={onDeleteBulk}
                onDownloadBulk={onDownloadBulk}
                onEntityDeselected={onEntityDeselected}
                onEntitySelected={onEntitySelected}
                onFirstClick={onFirstClick}
                onLastClick={onLastClick}
                onNextClick={onNextClick}
                onPreviousClick={onPreviousClick}
                onScannerCertificateDownloadClick={downloadCertificate}
                onScannerCloneClick={clone}
                onScannerCredentialDownloadClick={downloadCredential}
                onScannerDeleteClick={deleteFunc}
                onScannerDownloadClick={download}
                onScannerEditClick={edit}
                onScannerVerifyClick={verify}
                onSelectionTypeChange={onSelectionTypeChange}
                onSortChange={onSortChange}
                onTagsBulk={onTagsBulk}
              />
            }
            title={_('Scanners')}
            toolBarIcons={
              <ScannerListPageToolBarIcons onScannerCreateClick={create} />
            }
            onError={onError}
            onFilterChanged={onFilterChanged}
            onFilterCreated={onFilterCreated}
            onFilterRemoved={onFilterRemoved}
            onFilterReset={onFilterReset}
          />
        </>
      )}
    </ScannerComponent>
  );
};

export default withEntitiesContainer<Scanner>('scanner', {
  entitiesSelector,
  loadEntities,
})(ScannerListPage);
