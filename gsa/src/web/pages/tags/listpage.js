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

import {_, _l} from 'gmp/locale/lang';

import {TAGS_FILTER_FILTER} from 'gmp/models/filter';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import TagIcon from 'web/components/icon/tagicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tags';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import TagComponent from './component';
import TagsTable from './table';

export const SORT_FIELDS = [
  {
    name: 'name',
    displayName: _l('Name'),
    width: '30%',
  },
  {
    name: 'value',
    displayName: _l('Value'),
    width: '30%',
  },
  {
    name: 'active',
    displayName: _l('Active'),
    width: '8%',
  },
  {
    name: 'resource_type',
    displayName: _l('Resource Type'),
    width: '8%',
  },
  {
    name: 'modified',
    displayName: _l('Modified'),
    width: '8%',
  },
];

const ToolBarIcons = withCapabilities(({capabilities, onTagCreateClick}) => (
  <IconDivider>
    <ManualIcon
      page="web-interface"
      anchor="managing-tags"
      title={_('Help: Tags')}
    />
    {capabilities.mayCreate('tag') && (
      <NewIcon title={_('New Tag')} onClick={onTagCreateClick} />
    )}
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onTagCreateClick: PropTypes.func.isRequired,
};

const TagsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const TagsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <TagComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onDisableError={onError}
    onDisabled={onChanged}
    onEnableError={onError}
    onEnabled={onChanged}
    onInteraction={onInteraction}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
      enable,
      disable,
    }) => (
      <React.Fragment>
        <PageTitle title={_('Tags')} />
        <EntitiesPage
          {...props}
          filterEditDialog={TagsFilterDialog}
          filterFilter={TAGS_FILTER_FILTER}
          sectionIcon={<TagIcon size="large" />}
          table={TagsTable}
          tags={false}
          title={_('Tags')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
          onTagCloneClick={clone}
          onTagCreateClick={create}
          onTagDeleteClick={delete_func}
          onTagDownloadClick={download}
          onTagEditClick={edit}
          onTagSaveClick={save}
          onTagEnableClick={enable}
          onTagDisableClick={disable}
        />
      </React.Fragment>
    )}
  </TagComponent>
);

TagsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('tag', {
  entitiesSelector,
  loadEntities,
})(TagsPage);

// vim: set ts=2 sw=2 tw=80:
