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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {first, is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import TextField from '../components/form/textfield.js';
import Select2 from '../components/form/select2.js';

import EditIcon from '../components/icon/editicon.js';
import HelpIcon from '../components/icon/helpicon.js';
import Icon from '../components/icon/icon.js';
import NewIcon from '../components/icon/newicon.js';
import TrashIcon from '../components/icon/trashicon.js';

import Divider from '../components/layout/divider.js';
import IconDivider from '../components/layout/icondivider.js';

import DetailsLink from '../components/link/detailslink.js';

import Section from '../components/section/section.js';

import Table from '../components/table/stripped.js';
import TableBody from '../components/table/body.js';
import TableData from '../components/table/data.js';
import TableHeader from '../components/table/header.js';
import TableHead from '../components/table/head.js';
import TableRow from '../components/table/row.js';

const TagIcon = props => {
  return (
    <Icon {...props} img="tag.svg" size="small" />
  );
};

class AddTag extends React.Component {

  constructor(...args) {
    super(...args);

    const {entity} = this.props;

    const tags = new Set(entity.user_tags.map(tag => tag.name));
    this.state = {
      name: first(entity.user_tags).name,
      value: '',
      tags: [...tags],
    };

    this.handleAddTag = this.handleAddTag.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  componentWillReceiveProps(next) {
    const {entity} = next;
    const {name} = this.state;

    if (!is_defined(entity)) {
      this.setState({
        name: '',
        tags: [],
      });
    }

    if (this.props.entity !== entity) {
      const tags = new Set(entity.user_tags.map(tag => tag.name));
      if (!tags.has(name)) {
        this.setState({
          name: first(entity.user_tags).name,
          tags: [...tags],
        });
      }
    }
  }

  onValueChange(value, name) {
    this.setState({[name]: value});
  }

  handleAddTag() {
    const {name, value} = this.state;
    const {entity, onAddTag} = this.props;

    onAddTag({
      name,
      value,
      entity,
    }).then(() => {
      this.setState({
        name: '',
        value: '',
      });
    });
  }

  render() {
    const {name, value, tags} = this.state;

    if (tags.length === 0) {
      return null;
    }

    return (
      <Divider>
        <b>{_('Add Tag')}</b>
        <Select2
          name="name"
          value={name}
          onChange={this.onValueChange}>
          {tags.map(tag => {
            return (
              <option key={tag} value={tag}>
                {tag}
              </option>
            );
          })}
        </Select2>
        <span>with Value</span>
        <TextField
          name="value"
          value={value}
          onChange={this.onValueChange}
        />
        <TagIcon
          title={_('Add Tag')}
          onClick={this.handleAddTag}
        />
      </Divider>
    );
  }
}

AddTag.propTypes = {
  entity: PropTypes.model.isRequired,
  onAddTag: PropTypes.func.isRequired,
};

const SectionElementDivider = glamorous(Divider)({
  marginBottom: '3px',
});

const SectionElements = ({
  entity,
  onAddTag,
  onNewTagClick,
}) => {
  return (
    <SectionElementDivider margin="10px">
      <AddTag
        entity={entity}
        onAddTag={onAddTag}
      />
      <IconDivider>
        <NewIcon
          title={_('New Tag')}
          value={{type: 'result', entity}}
          onClick={onNewTagClick}
        />
        <HelpIcon
          page="user-tags"
          title={_('Help: User Tags list')}
        />
      </IconDivider>
    </SectionElementDivider>
  );
};

SectionElements.propTypes = {
  entity: PropTypes.model.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onNewTagClick: PropTypes.func.isRequired,
};

const EntityTags = ({
  entity,
  foldable = true,
  onAddTag,
  onDeleteTag,
  onDisableTag,
  onEditTagClick,
  onNewTagClick,
}) => {
  const extra = (
    <SectionElements
      entity={entity}
      onAddTag={onAddTag}
      onNewTagClick={onNewTagClick}
    />
  );
  const tags = entity.user_tags;
  const has_tags = is_defined(tags);
  const count = has_tags ? tags.length : 0;
  return (
    <Section
      foldable={foldable}
      extra={extra}
      img={<TagIcon/>}
      title={_('User Tags ({{count}})', {count})}
    >
      {tags.length > 0 &&
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('Value')}
              </TableHead>
              <TableHead>
                {_('Comment')}
              </TableHead>
              <TableHead width="5em">
                {_('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              tags.map(tag => {
                return (
                  <TableRow
                    key={tag.id}>
                    <TableData>
                      <DetailsLink
                        legacy
                        id={tag.id}
                        type="tag">
                        {tag.name}
                      </DetailsLink>
                    </TableData>
                    <TableData>
                      {tag.value}
                    </TableData>
                    <TableData>
                      {tag.comment}
                    </TableData>
                    <TableData>
                      <IconDivider>
                        <Icon
                          img="disable.svg"
                          value={tag}
                          title={_('Disable Tag')}
                          onClick={onDisableTag}
                        />
                        <TrashIcon
                          value={tag}
                          title={_('Move Tag to Trashcan')}
                          onClick={onDeleteTag}
                        />
                        <EditIcon
                          value={tag}
                          title={_('Edit Tag')}
                          onClick={onEditTagClick}
                        />
                      </IconDivider>
                    </TableData>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      }
    </Section>
  );
};

EntityTags.propTypes = {
  entity: PropTypes.model.isRequired,
  foldable: PropTypes.bool,
  onAddTag: PropTypes.func.isRequired,
  onDeleteTag: PropTypes.func.isRequired,
  onDisableTag: PropTypes.func.isRequired,
  onEditTagClick: PropTypes.func.isRequired,
  onNewTagClick: PropTypes.func.isRequired,
};

export default EntityTags;

// vim: set ts=2 sw=2 tw=80:
