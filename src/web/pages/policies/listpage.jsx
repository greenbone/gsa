/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {RESET_FILTER, SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import PolicyIcon from 'web/components/icon/policyicon';
import UploadIcon from 'web/components/icon/uploadicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/policies';
import PropTypes from 'web/utils/proptypes';

import PoliciesComponent from './component';
import Table from './table';

export const ToolBarIcons = ({onPolicyCreateClick, onPolicyImportClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="configuring-and-managing-policies"
        page="compliance-and-special-scans"
        title={_('Help: Policies')}
      />
      {capabilities.mayCreate('config') && (
        <NewIcon title={_('New Policy')} onClick={onPolicyCreateClick} />
      )}
      {capabilities.mayCreate('config') && (
        <UploadIcon title={_('Import Policy')} onClick={onPolicyImportClick} />
      )}
    </IconDivider>
  );
};

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
}) => {
  const [_] = useTranslation();
  return (
    <PoliciesComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
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
            onCreateAuditClick={createAudit}
            onError={onError}
            onInteraction={onInteraction}
            onPolicyCloneClick={clone}
            onPolicyCreateClick={create}
            onPolicyDeleteClick={deleteFunc}
            onPolicyDownloadClick={download}
            onPolicyEditClick={edit}
            onPolicyImportClick={importFunc}
          />
        </React.Fragment>
      )}
    </PoliciesComponent>
  );
};

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
