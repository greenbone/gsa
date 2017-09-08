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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';
import withContext from '../utils/withContext.js';

import Wrapper from '../components/layout/wrapper.js';

import TagDialog from '../pages/tags/dialog.js';

const withHandleTags = ({resource_type} = {}) => Component => {

  class HandleTagsWrapper extends React.Component {

    constructor(...args) {
      super(...args);

      this.handleAddTag = this.handleAddTag.bind(this);
      this.handleDeleteTag = this.handleDeleteTag.bind(this);
      this.handleDisableTag = this.handleDisableTag.bind(this);
      this.handleEnableTag = this.handleEnableTag.bind(this);
      this.handleSaveTag = this.handleSaveTag.bind(this);

      this.openCreateTagDialog = this.openCreateTagDialog.bind(this);
      this.openEditTagDialog = this.openEditTagDialog.bind(this);
    }

    handleSaveTag(data) {
      const {gmp, onSuccess, onError} = this.props;

      let promise;

      if (is_defined(data.id)) {
        promise = gmp.tag.save(data);
      }
      else {
        promise = gmp.tag.create(data);
      }

      return promise.then(onSuccess, onError);
    }

    handleAddTag({name, value, entity}) {
      const {
        gmp,
        resourceType = resource_type,
        onSuccess,
        onError,
      } = this.props;

      return gmp.tag.create({
        name,
        value,
        active: 1,
        resource_id: entity.id,
        resource_type: resourceType,
      }).then(onSuccess, onError);
    }

    handleEnableTag(tag) {
      const {gmp, onSuccess, onError} = this.props;

      return gmp.tag.enable(tag).then(onSuccess, onError);
    }

    handleDisableTag(tag) {
      const {gmp, onSuccess, onError} = this.props;

      return gmp.tag.disable(tag).then(onSuccess, onError);
    }

    handleDeleteTag(tag) {
      const {gmp, onSuccess, onError} = this.props;

      return gmp.tag.delete(tag).then(onSuccess, onError);
    }

    openEditTagDialog(tag) {
      const {gmp} = this.props;

      gmp.tag.get(tag).then(response => {
        const t = response.data;
        this.tag_dialog.show({
          fixed: true,
          id: t.id,
          active: t.active,
          name: t.name,
          value: t.value,
          comment: t.comment,
          resource_id: t.resource.id,
          resource_type: t.resource.entity_type,
        }, {title: _('Edit Tag {{name}}', tag)});
      });
    }

    openCreateTagDialog(entity) {
      this.tag_dialog.show({
        fixed: true,
        resource_id: entity.id,
        resource_type: entity.entity_type,
        name: _('{{type}}:unnamed', {type: entity.entity_type}),
      });
    }

    render() {
      const {...props} = this.props;
      return (
        <Wrapper>
          <Component
            {...props}
            onAddTag={this.handleAddTag}
            onNewTagClick={this.openCreateTagDialog}
            onEditTagClick={this.openEditTagDialog}
            onEnableTag={this.handleEnableTag}
            onDeleteTag={this.handleDeleteTag}
            onDisableTag={this.handleDisableTag}
          />
          <TagDialog
            ref={ref => this.tag_dialog = ref}
            onSave={this.handleSaveTag}
          />
        </Wrapper>
      );
    }
  }

  HandleTagsWrapper.propTypes = {
    gmp: PropTypes.gmp.isRequired,
    resourceType: PropTypes.string,
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
  };

  return withContext({
    gmp: PropTypes.gmp.isRequired,
  })(HandleTagsWrapper);
};

export default withHandleTags;

// vim: set ts=2 sw=2 tw=80:
