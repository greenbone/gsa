/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from '../../locale.js';
import {is_defined, shorten} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import EntitiesPage from '../entities/page.js';
import {withEntitiesContainer} from '../entities/container.js';
import {createEntitiesFooter} from '../entities/footer.js';
import {createEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import HelpIcon from '../icons/helpicon.js';
import NewIcon from '../icons/newicon.js';

import {createFilterDialog} from '../powerfilter/dialog.js';

import TagDialog from './dialog.js';
import Row from './row.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['value', _('Value')],
  ['active', _('Active')],
  ['resource_type', _('Resource Type')],
  ['resource_name', _('Resource Name')],
  ['modified', _('Modified')],
];

const ToolBarIcons = ({
    onNewTagClick
  }, {capabilities}) => {
  return (
    <Layout flex>
      <HelpIcon
        page="tags"
        title={_('Help: Tags')}/>
      {capabilities.mayCreate('tag') &&
        <NewIcon
          title={_('New Tag')}
          onClick={onNewTagClick}/>
      }
    </Layout>
  );
};

ToolBarIcons.propTypes = {
  onNewTagClick: React.PropTypes.func,
};

ToolBarIcons.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleEnableTag = this.handleEnableTag.bind(this);
    this.handleDisableTag = this.handleDisableTag.bind(this);
    this.handleSaveTag = this.handleSaveTag.bind(this);
    this.openTagDialog = this.openTagDialog.bind(this);
  }

  handleSaveTag(data) {
    const {onChanged, entityCommand} = this.props;
    let promise;

    if (is_defined(data.tag)) {
      promise = entityCommand.save(data);
    }
    else {
      promise = entityCommand.create(data);
    }

    return promise.then(() => onChanged());
  }

  handleEnableTag(tag) {
    const {onChanged, entityCommand, showError} = this.props;

    entityCommand.enable(tag).then(() => onChanged(), showError);
  }

  handleDisableTag(tag) {
    const {onChanged, entityCommand, showError} = this.props;

    entityCommand.disable(tag).then(() => onChanged(), showError);
  }

  openTagDialog(tag) {
    if (is_defined(tag)) {
      this.tag_dialog.show({
        id: tag.id,
        tag,
        name: tag.name,
        comment: tag.comment,
        value: tag.value,
        active: tag.active,
        resource_id: tag.resource.id,
        resource_type: tag.resource.type,
      }, {
        title: _('Edit tag {{name}}', {name: shorten(tag.name)}),
      });
    }
    else {
      this.tag_dialog.show({});
    }
  }

  render() {
    return (
      <Layout>
        <EntitiesPage
          {...this.props}
          onTagEnable={this.handleEnableTag}
          onTagDisable={this.handleDisableTag}
          onEntityEdit={this.openTagDialog}
          onNewTagClick={this.openTagDialog}
        />
        <TagDialog
          ref={ref => this.tag_dialog = ref}
          onSave={this.handleSaveTag}
        />
      </Layout>
    );
  }
}

Page.propTypes = {
  entityCommand: PropTypes.entitycommand,
  onChanged: React.PropTypes.func,
  showError: React.PropTypes.func.isRequired,
  showSuccess: React.PropTypes.func.isRequired,
};

const Table = createEntitiesTable({
  emptyTitle: _('No tags available'),
  header: createEntitiesHeader(SORT_FIELDS),
  row: Row,
  footer: createEntitiesFooter({
    download: 'tags.xml',
    span: 7,
    trash: true,
  }),
});

export default withEntitiesContainer(Page, 'tag', {
  filterEditDialog: createFilterDialog({
    sortFields: SORT_FIELDS,
  }),
  sectionIcon: 'tag.svg',
  table: Table,
  title: _('Tags'),
  toolBarIcons: ToolBarIcons,
});

// vim: set ts=2 sw=2 tw=80:
