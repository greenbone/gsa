/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';
import UploadIcon from 'web/components/icon/uploadicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigFilterDialog from 'web/pages/scanconfigs/filterdialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ScanConfigComponent from './component';
import Table from './table';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onScanConfigCreateClick, onScanConfigImportClick}) => {
    const [_] = useTranslation();
    return (
      <IconDivider>
        <ManualIcon
          anchor="managing-scan-configurations"
          page="scanning"
          title={_('Help: Scan Configs')}
        />
        {capabilities.mayCreate('config') && (
          <NewIcon
            title={_('New Scan Config')}
            onClick={onScanConfigCreateClick}
          />
        )}
        {capabilities.mayCreate('config') && (
          <UploadIcon
            title={_('Import Scan Config')}
            onClick={onScanConfigImportClick}
          />
        )}
      </IconDivider>
    );
  },
);

ToolBarIcons.propTypes = {
  onScanConfigCreateClick: PropTypes.func.isRequired,
  onScanConfigImportClick: PropTypes.func.isRequired,
};

const ScanConfigsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <ScanConfigComponent
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
        delete: delete_func,
        download,
        edit,
        import: import_func,
      }) => (
        <>
          <PageTitle title={_('Scan Configs')} />
          <EntitiesPage
            {...props}
            filterEditDialog={ScanConfigFilterDialog}
            filtersFilter={SCANCONFIGS_FILTER_FILTER}
            sectionIcon={<ScanConfigIcon size="large" />}
            table={Table}
            title={_('Scan Configs')}
            toolBarIcons={ToolBarIcons}
            onError={onError}
            onInteraction={onInteraction}
            onScanConfigCloneClick={clone}
            onScanConfigCreateClick={create}
            onScanConfigDeleteClick={delete_func}
            onScanConfigDownloadClick={download}
            onScanConfigEditClick={edit}
            onScanConfigImportClick={import_func}
          />
        </>
      )}
    </ScanConfigComponent>
  );
};

ScanConfigsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('scanconfig', {
  entitiesSelector,
  loadEntities,
})(ScanConfigsPage);
