/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {SCANCONFIGS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/ManualIcon';
import NewIcon from 'web/components/icon/NewIcon';
import ScanConfigIcon from 'web/components/icon/ScanConfigIcon';
import UploadIcon from 'web/components/icon/UploadIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import ScanConfigFilterDialog from 'web/pages/scanconfigs/FilterDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/scanconfigs';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

import ScanConfigComponent from './Component';
import Table from './Table';

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
        settings,
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
            onScanConfigSettingsClick={settings}
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
