/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {TARGETS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import TargetIcon from 'web/components/icon/targeticon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/targets';
import PropTypes from 'web/utils/proptypes';

import TargetComponent from './component';
import TargetsFilterDialog from './filterdialog';
import TargetsTable from './table';

export const ToolBarIcons = ({onTargetCreateClick}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-targets"
        page="scanning"
        title={_('Help: Targets')}
      />
      {capabilities.mayCreate('target') && (
        <NewIcon title={_('New Target')} onClick={onTargetCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onTargetCreateClick: PropTypes.func.isRequired,
};

const TargetsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <TargetComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <React.Fragment>
          <PageTitle title={_('Targets')} />
          <EntitiesPage
            {...props}
            filterEditDialog={TargetsFilterDialog}
            filtersFilter={TARGETS_FILTER_FILTER}
            sectionIcon={<TargetIcon size="large" />}
            table={TargetsTable}
            title={_('Targets')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onDownloaded={onDownloaded}
            onError={onError}
            onInteraction={onInteraction}
            onTargetCloneClick={clone}
            onTargetCreateClick={create}
            onTargetDeleteClick={delete_func}
            onTargetDownloadClick={download}
            onTargetEditClick={edit}
            onTargetSaveClick={save}
          />
        </React.Fragment>
      )}
    </TargetComponent>
  );
};

TargetsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('target', {
  entitiesSelector,
  loadEntities,
})(TargetsPage);

// vim: set ts=2 sw=2 tw=80:
