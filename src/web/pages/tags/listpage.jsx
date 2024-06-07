/* Copyright (C) 2017-2022 Greenbone AG
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

import {TAGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import TagIcon from 'web/components/icon/tagicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tags';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/utils/useCapabilities';

import TagComponent from './component';
import TagsTable from './table';
import TagsFilterDialog from './filterdialog';

const ToolBarIcons = ({onTagCreateClick}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
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
  );
};

ToolBarIcons.propTypes = {
  onTagCreateClick: PropTypes.func.isRequired,
};

const TagsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();
  return (
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
};

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
