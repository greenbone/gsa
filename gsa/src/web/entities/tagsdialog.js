/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';

import React from 'react';

import _ from 'gmp/locale.js';
import {pluralizeType, normalizeType} from 'gmp/utils/entitytype';
import {is_defined} from 'gmp/utils/identity';
import {render_select_items} from 'web/utils/render.js';

import withGmp from 'web/utils/withGmp';

import PropTypes from '../utils/proptypes.js';
import SelectionType from '../utils/selectiontype.js';

import SaveDialog from '../components/dialog/savedialog.js';

import FormGroup from '../components/form/formgroup.js';
import Select from '../components/form/select.js';

import NewIcon from '../components/icon/newicon.js';

import Divider from '../components/layout/divider.js';
import Layout from '../components/layout/layout.js';

class TagsDialog extends React.Component {

  constructor(args) {
    super(...args);

    this.state = {};

    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    const {
      filter,
      gmp,
      resourceType,
    } = this.props;

    gmp[pluralizeType(normalizeType(resourceType))].getAll({filter})
    .then(response => {
      const numberOfFilteredEntities = response.data.length;
      const noticeText = numberOfFilteredEntities >= 1000 ?
        _('Please note that assigning a tag to a large number of resources ' +
          ' may take several minutes.') :
        '';
        this.setState({noticeText});
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (is_defined(nextProps.tag) && nextProps.tag.id !== prevState.propId) {
      return {
        ...nextProps.tag,
        propId: nextProps.tag.id,
      };
    }
    return null;
  }

  handleChange(value, name) {
    const {gmp} = this.props;
    gmp.tag.get({id: value}).then(response => {
      this.setState({
        ...response.data,
      });
    });
  }

  save() {
    const {
      filter,
      gmp,
      resources,
      resourceType,
      selectionType,
    } = this.props;

    const {
      active,
      comment,
      id,
      name,
      value = '',
    } = this.state;

    if (selectionType === SelectionType.SELECTION_USER) {
      const resource_ids = [];

      resources.forEach(res => resource_ids.push(res.id));

      return gmp.tag.save({
        active,
        comment,
        id,
        name,
        resource_ids,
        resource_type: resourceType,
        resources_action: 'add',
        value,
      });
    }

    if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      return gmp.tag.save({
        active,
        comment,
        filter,
        id,
        name,
        resource_type: resourceType,
        resources_action: 'add',
        value,
      });
    }

    return gmp.tag.save({
      active,
      comment,
      filter: filter.all(),
      id,
      name,
      resource_type: resourceType,
      resources_action: 'add',
      value,
    });
  }

  render() {
    const {
      tags,
      title = _('Add Tag'),
      onClose,
      onNewTagClick,
    } = this.props;

    const {
      comment,
      id,
      name,
      noticeText = '',
      value,
    } = this.state;

    return (
      <SaveDialog
        buttonTitle="Add Tag"
        title={title}
        width="650px"
        values={{
          comment,
          id,
          name,
          value,
        }}
        onClose={onClose}
        onSave={this.save}
      >
        {({
          values: state,
          onValueChange,
        }) => {
          return (
            <Layout flex="column">
              <FormGroup title={_('Choose Tag')} titleSize="4">
                <Divider>
                  <Select
                    menuPosition="adjust"
                    name="name"
                    value={id}
                    width="230"
                    items={render_select_items(tags)}
                    onChange={this.handleChange}
                  />
                  <NewIcon
                    value={'tag'}
                    title={_('Create a new Tag')}
                    onClick={onNewTagClick}
                  />
                </Divider>
              </FormGroup>
              <FormGroup title={_('Value')} titleSize="4">
                {is_defined(value) ? value : ''}
              </FormGroup>
              <FormGroup title={_('Comment')} titleSize="4">
                {is_defined(comment) ? comment : ''}
              </FormGroup>
              {noticeText}
            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
};

TagsDialog.propTypes = {
  active: PropTypes.yesno,
  comment: PropTypes.string,
  filter: PropTypes.filter,
  fixed: PropTypes.bool,
  gmp: PropTypes.gmp.isRequired,
  name: PropTypes.string,
  resourceType: PropTypes.string.isRequired,
  resources: PropTypes.object,
  selectionType: PropTypes.string.isRequired,
  tags: PropTypes.array,
  title: PropTypes.string,
  value: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewTagClick: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default withGmp(TagsDialog);

// vim: set ts=2 sw=2 tw=80:
