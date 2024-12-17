/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {CREDENTIALS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import CredentialIcon from 'web/components/icon/credentialicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/credentials';
import PropTypes from 'web/utils/proptypes';

import CredentialComponent from './component';
import CredentialsFilterDialog from './filterdialog';
import CredentialsTable from './table';

export const ToolBarIcons = ({onCredentialCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-credentials"
        page="scanning"
        title={_('Help: Credentials')}
      />
      {capabilities.mayCreate('credential') && (
        <NewIcon
          title={_('New Credential')}
          onClick={onCredentialCreateClick}
        />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onCredentialCreateClick: PropTypes.func.isRequired,
};

const CredentialsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
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
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        downloadinstaller,
        edit,
        save,
      }) => (
        <React.Fragment>
          <PageTitle title={_('Credentials')} />
          <EntitiesPage
            {...props}
            filterEditDialog={CredentialsFilterDialog}
            filtersFilter={CREDENTIALS_FILTER_FILTER}
            sectionIcon={<CredentialIcon size="large" />}
            table={CredentialsTable}
            title={_('Credentials')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onCredentialCloneClick={clone}
            onCredentialCreateClick={create}
            onCredentialDeleteClick={delete_func}
            onCredentialDownloadClick={download}
            onCredentialEditClick={edit}
            onCredentialInstallerDownloadClick={downloadinstaller}
            onCredentialSaveClick={save}
            onDownloaded={onDownloaded}
            onError={onError}
            onInteraction={onInteraction}
          />
        </React.Fragment>
      )}
    </CredentialComponent>
  );
};

CredentialsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('credential', {
  entitiesSelector,
  loadEntities,
})(CredentialsPage);
