/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {FILTERS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import FilterIcon from 'web/components/icon/filtericon';
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
} from 'web/store/entities/filters';
import PropTypes from 'web/utils/proptypes';

import FilterComponent from './component';
import FiltersFilterDialog from './filterdialog';
import FiltersTable from './table';

const ToolBarIcons = ({onFilterCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-powerfilters"
        page="web-interface"
        title={_('Help: Filters')}
      />
      {capabilities.mayCreate('filter') && (
        <NewIcon title={_('New Filter')} onClick={onFilterCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onFilterCreateClick: PropTypes.func.isRequired,
};

const FiltersPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <FilterComponent
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
          <PageTitle title={_('Filters')} />

          <EntitiesPage
            {...props}
            filterEditDialog={FiltersFilterDialog}
            filtersFilter={FILTERS_FILTER_FILTER}
            sectionIcon={<FilterIcon size="large" />}
            table={FiltersTable}
            title={_('Filters')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onDownloaded={onDownloaded}
            onError={onError}
            onFilterCloneClick={clone}
            onFilterCreateClick={create}
            onFilterDeleteClick={delete_func}
            onFilterDownloadClick={download}
            onFilterEditClick={edit}
            onFilterSaveClick={save}
            onInteraction={onInteraction}
          />
        </React.Fragment>
      )}
    </FilterComponent>
  );
};

FiltersPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('filter', {
  entitiesSelector,
  loadEntities,
})(FiltersPage);
