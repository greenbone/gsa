/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import NewIcon from 'web/components/icon/newicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';

import PageTitle from 'web/components/layout/pagetitle';

import IconDivider from 'web/components/layout/icondivider';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';

import ScanConfigComponent from './component';
import Table from './table';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigFilterDialog from 'web/pages/scanconfigs/filterdialog';

export const ToolBarIcons = withCapabilities(
  ({capabilities, onScanConfigCreateClick, onScanConfigImportClick}) => {
    const [_] = useTranslation();
    return (
      <IconDivider>
        <ManualIcon
          page="scanning"
          anchor="managing-scan-configurations"
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
            onScanConfigImportClick={import_func}
            onScanConfigCloneClick={clone}
            onScanConfigCreateClick={create}
            onScanConfigDeleteClick={delete_func}
            onScanConfigDownloadClick={download}
            onScanConfigEditClick={edit}
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
