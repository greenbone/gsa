/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {CREDENTIALS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import CredentialIcon from 'web/components/icon/credentialicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/credentials';

import CredentialComponent from './component';
import CredentialsTable, {SORT_FIELDS} from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onCredentialCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="managing-credentials"
        title={_('Help: Credentials')}
      />
      {capabilities.mayCreate('credential') && (
        <NewIcon
          title={_('New Credential')}
          onClick={onCredentialCreateClick}
        />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onCredentialCreateClick: PropTypes.func.isRequired,
};

const CredentialsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const CredentialsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <CredentialComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInstallerDownloaded={onDownloaded}
    onInstallerDownloadError={onError}
    onInteraction={onInteraction}
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
          onCredentialSaveClick={save}
          onCredentialInstallerDownloadClick={downloadinstaller}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
        />
      </React.Fragment>
    )}
  </CredentialComponent>
);

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

// vim: set ts=2 sw=2 tw=80:
