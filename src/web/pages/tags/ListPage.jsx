/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {TAGS_FILTER_FILTER} from 'gmp/models/filter';
import {NewIcon, TagIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import TagsTable from 'web/pages/tags/Table';
import TagFilterDialog from 'web/pages/tags/TagFilterDialog';
import TagComponent from 'web/pages/tags/TagsComponent';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tags';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({onTagCreateClick}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-tags"
        page="web-interface"
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

  ...props
}) => {
  const [_] = useTranslation();
  return (
    <TagComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDisableError={onError}
      onDisabled={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onEnableError={onError}
      onEnabled={onChanged}
      onSaved={onChanged}
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
        <>
          <PageTitle title={_('Tags')} />
          <EntitiesPage
            {...props}
            filterEditDialog={TagFilterDialog}
            filtersFilter={TAGS_FILTER_FILTER}
            sectionIcon={<TagIcon size="large" />}
            table={TagsTable}
            tags={false}
            title={_('Tags')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onDownloaded={onDownloaded}
            onError={onError}
            onTagCloneClick={clone}
            onTagCreateClick={create}
            onTagDeleteClick={delete_func}
            onTagDisableClick={disable}
            onTagDownloadClick={download}
            onTagEditClick={edit}
            onTagEnableClick={enable}
            onTagSaveClick={save}
          />
        </>
      )}
    </TagComponent>
  );
};

TagsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('tag', {
  entitiesSelector,
  loadEntities,
})(TagsPage);
