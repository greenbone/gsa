/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {FILTERS_FILTER_FILTER} from 'gmp/models/filter';

import FilterIcon from 'web/components/icon/filtericon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/filters';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import FilterComponent from './component';
import FiltersTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({capabilities, onFilterCreateClick}) => (
  <IconDivider>
    <ManualIcon
      page="web-interface"
      anchor="managing-powerfilters"
      title={_('Help: Filters')}
    />
    {capabilities.mayCreate('filter') && (
      <NewIcon title={_('New Filter')} onClick={onFilterCreateClick} />
    )}
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onFilterCreateClick: PropTypes.func.isRequired,
};

const FiltersFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const FiltersPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <FilterComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
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

// vim: set ts=2 sw=2 tw=80:
