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

import {TARGETS_FILTER_FILTER} from 'gmp/models/filter';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import TargetIcon from 'web/components/icon/targeticon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/targets';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import TargetsFilterDialog from './filterdialog';
import TargetsTable from './table';
import TargetComponent from './component';

const ToolBarIcons = withCapabilities(({capabilities, onTargetCreateClick}) => (
  <IconDivider>
    <ManualIcon
      page="scanning"
      anchor="managing-targets"
      title={_('Help: Targets')}
    />
    {capabilities.mayCreate('target') && (
      <NewIcon title={_('New Target')} onClick={onTargetCreateClick} />
    )}
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onTargetCreateClick: PropTypes.func.isRequired,
};

const TargetsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <TargetComponent
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
