/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {RESET_FILTER, SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import PolicyIcon from 'web/components/icon/policyicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';
import ManualIcon from 'web/components/icon/manualicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/policies';

import PoliciesComponent from './component';
import Table from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onPolicyCreateClick, onPolicyImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="compliance-and-special-scans"
        anchor="configuring-and-managing-policies"
        title={_('Help: Policies')}
      />
      {capabilities.mayCreate('config') && (
        <NewIcon title={_('New Policy')} onClick={onPolicyCreateClick} />
      )}
      {capabilities.mayCreate('config') && (
        <UploadIcon title={_('Import Policy')} onClick={onPolicyImportClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onPolicyCreateClick: PropTypes.func.isRequired,
  onPolicyImportClick: PropTypes.func.isRequired,
};

const PoliciesPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <PoliciesComponent
    onCloned={onChanged}
    onCloneError={onError}
    onCreated={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onImported={onChanged}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({
      clone,
      create,
      createAudit,
      delete: deleteFunc,
      download,
      edit,
      import: importFunc,
    }) => (
      <React.Fragment>
        <PageTitle title={_('Policies')} />
        <EntitiesPage
          {...props}
          filtersFilter={SCANCONFIGS_FILTER_FILTER}
          sectionIcon={<PolicyIcon size="large" />}
          table={Table}
          title={_('Policies')}
          toolBarIcons={ToolBarIcons}
          onError={onError}
          onInteraction={onInteraction}
          onPolicyImportClick={importFunc}
          onPolicyCloneClick={clone}
          onPolicyCreateClick={create}
          onCreateAuditClick={createAudit}
          onPolicyDeleteClick={deleteFunc}
          onPolicyDownloadClick={download}
          onPolicyEditClick={edit}
        />
      </React.Fragment>
    )}
  </PoliciesComponent>
);

PoliciesPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('policy', {
  entitiesSelector,
  loadEntities,
  defaultFilter: RESET_FILTER,
})(PoliciesPage);

// vim: set ts=2 sw=2 tw=80:
