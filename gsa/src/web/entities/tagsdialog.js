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

    this.handleTagChange = this.handleTagChange.bind(this);
  }

  componentDidMount() {
    const {
      filter,
      gmp,
      resourceType,
    } = this.props;

    gmp[pluralizeType(normalizeType(resourceType))].get({filter})
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

  handleTagChange(id) {
    const {gmp} = this.props;

    gmp.tag.get({id}).then(response => {
      this.setState({
        ...response.data,
      });
    });
  }

  render() {
    const {
      tags,
      title = _('Add Tag'),
      onClose,
      onNewTagClick,
      onSave,
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
        onSave={onSave}
      >
        {() => (
          <Layout flex="column">
            <FormGroup title={_('Choose Tag')} titleSize="4">
              <Divider>
                <Select
                  menuPosition="adjust"
                  name="name"
                  value={id}
                  width="230"
                  items={render_select_items(tags)}
                  onChange={this.handleTagChange}
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
        )}
      </SaveDialog>
    );
  }
};

TagsDialog.propTypes = {
  filter: PropTypes.filter,
  gmp: PropTypes.gmp.isRequired,
  resourceType: PropTypes.string.isRequired,
  tags: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onNewTagClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default withGmp(TagsDialog);

// vim: set ts=2 sw=2 tw=80:
