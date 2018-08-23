/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {getEntityType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import TagComponent from 'web/pages/tags/component';

class TagsHandler extends React.Component {

  constructor(...args) {
    super(...args);

    this.openCreateTagDialog = this.openCreateTagDialog.bind(this);
    this.openEditTagDialog = this.openEditTagDialog.bind(this);
  }

  openEditTagDialog(tag, edit) {
    const {gmp} = this.props;

    gmp.tag.get(tag).then(response => {
      const t = response.data;
      edit(t, {
        fixed: true,
      });
    });
  }

  openCreateTagDialog(entity, create) {
    const {
      resourceType = getEntityType(entity),
    } = this.props;
    create({
      fixed: true,
      resource_ids: [entity.id],
      resource_type: resourceType,
      name: _('{{type}}:unnamed', {type: resourceType}),
    });
  }

  render() {
    const {
      children,
      onChanged,
      onError,
      onInteraction,
    } = this.props;
    return (
      <TagComponent
        onAdded={onChanged}
        onAddError={onError}
        onCreated={onChanged}
        onCreateError={onError}
        onDeleted={onChanged}
        onDeleteError={onError}
        onDisabled={onChanged}
        onDisableError={onError}
        onEnabled={onChanged}
        onEnableError={onError}
        onInteraction={onInteraction}
        onRemoved={onChanged}
        onRemoveError={onError}
        onSaved={onChanged}
        onSaveError={onError}
      >{({
          add,
          create,
          delete: delete_func,
          disable,
          edit,
          enable,
          remove,
        }) => children({
            add,
            create: entity => this.openCreateTagDialog(entity, create),
            delete: delete_func,
            disable,
            edit: tag => this.openEditTagDialog(tag, edit),
            enable,
            remove,
          })
        }
      </TagComponent>
    );
  }
}

TagsHandler.propTypes = {
  gmp: PropTypes.gmp.isRequired,
  resourceType: PropTypes.string,
  onChanged: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withGmp(TagsHandler);

// vim: set ts=2 sw=2 tw=80:
