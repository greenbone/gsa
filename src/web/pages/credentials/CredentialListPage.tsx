/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Credential from 'gmp/models/credential';
import {CREDENTIALS_FILTER_FILTER} from 'gmp/models/filter';
import {CredentialIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import CredentialComponent from 'web/pages/credentials/CredentialComponent';
import CredentialFilterDialog from 'web/pages/credentials/CredentialFilterDialog';
import CredentialListPageToolBarIcons from 'web/pages/credentials/CredentialListPageToolBarIcons';
import CredentialTable from 'web/pages/credentials/CredentialTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/credentials';

type CredentialListPageProps = WithEntitiesContainerComponentProps<Credential>;

const CredentialsPage = ({
  entities,
  entitiesCounts,
  entitiesError,
  filter,
  selectionType,
  sortBy,
  sortDir,
  isLoading,
  isUpdating,
  onChanged,
  onDeleteBulk,
  onDownloadBulk,
  onDownloaded,
  onEntityDeselected,
  onEntitySelected,
  onError,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
  onSelectionTypeChange,
  onSortChange,
  onTagsBulk,
}: CredentialListPageProps) => {
  const [_] = useTranslation();
  return (
    <CredentialComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInstallerDownloadError={onError}
      onInstallerDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        downloadInstaller,
        edit,
      }) => (
        <>
          <PageTitle title={_('Credentials')} />
          <EntitiesPage<Credential>
            createFilterType="credential"
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            filter={filter}
            filterEditDialog={CredentialFilterDialog}
            filtersFilter={CREDENTIALS_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<CredentialIcon size="large" />}
            table={
              <CredentialTable
                entities={entities}
                entitiesCounts={entitiesCounts}
                filter={filter}
                isUpdating={isUpdating}
                selectionType={selectionType}
                sortBy={sortBy}
                sortDir={sortDir}
                onCredentialCloneClick={clone}
                onCredentialDeleteClick={deleteFunc}
                onCredentialDownloadClick={download}
                onCredentialEditClick={edit}
                onCredentialInstallerDownloadClick={downloadInstaller}
                onDeleteBulk={onDeleteBulk}
                onDownloadBulk={onDownloadBulk}
                onEntityDeselected={onEntityDeselected}
                onEntitySelected={onEntitySelected}
                onFirstClick={onFirstClick}
                onLastClick={onLastClick}
                onNextClick={onNextClick}
                onPreviousClick={onPreviousClick}
                onSelectionTypeChange={onSelectionTypeChange}
                onSortChange={onSortChange}
                onTagsBulk={onTagsBulk}
              />
            }
            title={_('Credentials')}
            toolBarIcons={
              <CredentialListPageToolBarIcons
                onCredentialCreateClick={create}
              />
            }
            onError={onError}
            onFilterChanged={onFilterChanged}
            onFilterCreated={onFilterCreated}
            onFilterRemoved={onFilterRemoved}
            onFilterReset={onFilterReset}
          />
        </>
      )}
    </CredentialComponent>
  );
};

export default withEntitiesContainer<Credential>('credential', {
  entitiesSelector,
  loadEntities,
})(CredentialsPage);
