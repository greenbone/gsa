/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {GROUPS_FILTER_FILTER} from 'gmp/models/filter';
import {GroupIcon, NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import GroupsFilterDialog from 'web/pages/groups/FilterDialog';
import GroupComponent from 'web/pages/groups/GroupComponent';
import Table from 'web/pages/groups/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/groups';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({onGroupCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-groups"
        page="web-interface-access"
        title={_('Help: Groups')}
      />
      {capabilities.mayCreate('group') && (
        <NewIcon title={_('New Group')} onClick={onGroupCreateClick} />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onGroupCreateClick: PropTypes.func.isRequired,
};

const GroupsPage = ({
  onChanged,
  onDownloaded,
  onError,

  ...props
}) => {
  const [_] = useTranslation();
  return (
    <GroupComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
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
          />
        </React.Fragment>
      )}
    </GroupComponent>
  );
};

GroupsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('group', {
  entitiesSelector,
  loadEntities,
})(GroupsPage);
