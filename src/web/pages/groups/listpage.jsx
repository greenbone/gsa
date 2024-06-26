/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {GROUPS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import GroupIcon from 'web/components/icon/groupicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/groups';

import GroupComponent from './component';
import Table, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(({capabilities, onGroupCreateClick}) => (
  <IconDivider>
    <ManualIcon
      page="web-interface-access"
      anchor="managing-groups"
      title={_('Help: Groups')}
    />
    {capabilities.mayCreate('group') && (
      <NewIcon title={_('New Group')} onClick={onGroupCreateClick} />
    )}
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onGroupCreateClick: PropTypes.func.isRequired,
};

const GroupsFilterDialog = createFilterDialog({sortFields: SORT_FIELDS});

const GroupsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <GroupComponent
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
        <PageTitle title={_('Groups')} />
        <EntitiesPage
          {...props}
          filterEditDialog={GroupsFilterDialog}
          filtersFilter={GROUPS_FILTER_FILTER}
          sectionIcon={<GroupIcon size="large" />}
          table={Table}
          title={_('Groups')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onGroupCloneClick={clone}
          onGroupCreateClick={create}
          onGroupDeleteClick={delete_func}
          onGroupDownloadClick={download}
          onGroupEditClick={edit}
          onGroupSaveClick={save}
          onInteraction={onInteraction}
        />
      </React.Fragment>
    )}
  </GroupComponent>
);

GroupsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('group', {
  entitiesSelector,
  loadEntities,
})(GroupsPage);

// vim: set ts=2 sw=2 tw=80:
