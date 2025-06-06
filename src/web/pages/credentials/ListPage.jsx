/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {CREDENTIALS_FILTER_FILTER} from 'gmp/models/filter';
import {CredentialIcon, NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import CredentialComponent from 'web/pages/credentials/CredentialsComponent';
import CredentialsFilterDialog from 'web/pages/credentials/FilterDialog';
import CredentialsTable from 'web/pages/credentials/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/credentials';
import PropTypes from 'web/utils/PropTypes';
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
