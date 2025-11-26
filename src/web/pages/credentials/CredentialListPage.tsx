/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Credential from 'gmp/models/credential';
import {CREDENTIALS_FILTER_FILTER} from 'gmp/models/filter';
import {CredentialIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import CredentialComponent from 'web/pages/credentials/CredentialComponent';
import CredentialFilterDialog from 'web/pages/credentials/CredentialFilterDialog';
import CredentialListPageToolBarIcons from 'web/pages/credentials/CredentialListPageToolBarIcons';
import CredentialTable from 'web/pages/credentials/CredentialTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/credentials';

const CredentialsPage = ({onChanged, onDownloaded, onError, ...props}) => {
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
            {...props}
            filterEditDialog={CredentialFilterDialog}
            filtersFilter={CREDENTIALS_FILTER_FILTER}
            sectionIcon={<CredentialIcon size="large" />}
            table={CredentialTable}
            title={_('Credentials')}
            toolBarIcons={CredentialListPageToolBarIcons}
            onChanged={onChanged}
            onCredentialCloneClick={clone}
            onCredentialCreateClick={create}
            onCredentialDeleteClick={deleteFunc}
            onCredentialDownloadClick={download}
            onCredentialEditClick={edit}
            onCredentialInstallerDownloadClick={downloadInstaller}
            onDownloaded={onDownloaded}
            onError={onError}
          />
        </>
      )}
    </CredentialComponent>
  );
};

export default withEntitiesContainer('credential', {
  entitiesSelector,
  loadEntities,
})(CredentialsPage);
