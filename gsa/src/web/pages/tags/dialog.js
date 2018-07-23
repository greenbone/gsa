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
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';

import React from 'react';

import glamorous from 'glamorous';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';
import {pluralizeType, normalizeType} from 'gmp/utils/entitytype';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from '../../utils/proptypes.js';
import {renderSelectItems} from '../../utils/render.js';
import withGmp from '../../utils/withGmp.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import MultiSelect from '../../components/form/multiselect.js';
import Select from '../../components/form/select.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import Layout from '../../components/layout/layout.js';

const Divider = glamorous.div({
  margin: '0 5px',
});

const ScrollableContent = glamorous.div({
  maxHeight: '200px',
  overflow: 'auto',
});

class TagDialog extends React.Component {

  constructor(...args) {
    super(...args);

    const {resource_ids = []} = this.props;

    this.state = {
      resourceIdText: '',
      resourceIdsSelected: resource_ids,
      resourceOptions: [],
      resourceType: this.props.resource_type,
    };

  }

  componentDidMount() {
    const {
      resourceType,
    } = this.state;

    if (isDefined(resourceType)) {
      this.loadResourcesByType(resourceType);
    }
  }

  loadResourcesByType(type) {
    if (!isDefined(type)) {
      return;
    }
    const {gmp} = this.props;
    const plType = pluralizeType(normalizeType(type));
    gmp[plType].getAll()
      .then(response => {
        const {data} = response;
        let id = this.state.resourceIdText;
        const idPresent = data.includes(res => res.id === id);
        if (!idPresent && !isEmpty(id)) {
          data.push({
            name: '----',
            id: id,
          });
        }
        if (isEmpty(id)) {
          id = undefined;
        }
        this.setState({
          resourceOptions: data,
        });
      });
  }

  handleResourceTypeChange(type, onValueChange) {

    onValueChange(type, 'resource_type');

    this.loadResourcesByType(type);
    this.setState({
      resourceIdsSelected: [],
      resourceType: type,
    });
  }

  handleIdChange(ids, onValueChange) {

    onValueChange(ids, 'resource_ids');

    this.setState({
      resourceIdsSelected: ids,
    });
  }

  handleIdChangeByText(id, onValueChange) {
    const {gmp} = this.props;
    const {
      resourceIdsSelected,
      resourceType,
    } = this.state;

    gmp[pluralizeType(normalizeType(resourceType))]
      .get({filter: 'uuid=' + id})
      .then(response => {
        const ids = isDefined(resourceIdsSelected) ? resourceIdsSelected : [];
        if (response.data.length === 0) {

          let {resourceOptions} = this.state;
          const idPresent = resourceOptions.filter(res => res.id === id);
          if (idPresent.length === 0 && !isEmpty(id)) {
            // if the options already contain '----', remove the old element
            resourceOptions = resourceOptions.filter(
              res => res.name !== '----');
            resourceOptions.push({
              name: '----',
              id: id,
            });
          }

          this.setState({
            resourceOptions,
            resourceIdText: id,
          });
        }
        else {
          const idSelected = ids.includes(id);
          if (idSelected) {
            this.setState({
              resourceIdText: '',
            });
          }
          else {
            this.setState(prevState => {
              const prevResourceIdsSelected = prevState.resourceIdsSelected;
              return {
                resourceIdsSelected: [
                  ...prevResourceIdsSelected,
                  id,
                ],
                resourceIdText: '',
              };
            });
          }
        }
      });
  }

  render() {
    const {
      active = YES_VALUE,
      comment = '',
      fixed = false,
      name = _('default:unnamed'),
      resource_types = [],
      title = _('New Tag'),
      value = '',
      visible = true,
      onClose,
      onSave,
      ...options
    } = this.props;

    const resourceTypesOptions = map(resource_types, rtype => ({
      label: rtype[1],
      value: rtype[0],
    }));

    const data = {
      ...options,
      active,
      comment,
      name,
      value,
    };

    const typeIsChosen = isDefined(this.state.resourceType);

    const controlledData = {
      resource_ids: this.state.resourceIdsSelected,
      resource_type: this.state.resourceType,
    };

    return (
      <SaveDialog
        visible={visible}
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultValues={data}
        values={controlledData}
      >
        {({
          values: state,
          onValueChange,
        }) => {
          return (
            <Layout flex="column">

              <FormGroup title={_('Name')}>
                <TextField
                  name="name"
                  grow="1"
                  value={state.name}
                  size="30"
                  onChange={onValueChange}
                  maxLength="80"
                />
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  grow="1"
                  size="30"
                  maxLength="400"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Value')}>
                <TextField
                  name="value"
                  value={state.value}
                  grow="1"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Resource Type')}>
                <Select
                  name="resource_type"
                  items={resourceTypesOptions}
                  value={this.state.resourceType}
                  disabled={fixed || resourceTypesOptions.length === 0}
                  onChange={type => this.handleResourceTypeChange(
                    type, onValueChange)}
                />
              </FormGroup>

              <FormGroup title={_('Resources')}>
                <ScrollableContent>
                  <MultiSelect
                    name="resource_ids"
                    items={renderSelectItems(this.state.resourceOptions)}
                    value={this.state.resourceIdsSelected}
                    disabled={!typeIsChosen || fixed ||
                      resourceTypesOptions.length === 0}
                    onChange={ids => this.handleIdChange(ids, onValueChange)}
                  />
                </ScrollableContent>
                <Divider>
                  {_('or add by ID:')}
                </Divider>
                <TextField
                  name="resource_id_text"
                  value={this.state.resourceIdText}
                  grow="1"
                  disabled={!typeIsChosen || fixed}
                  onChange={id => this.handleIdChangeByText(id, onValueChange)}
                />
              </FormGroup>
              <FormGroup title={_('Active')}>
                <YesNoRadio
                  name="active"
                  value={state.active}
                  onChange={onValueChange}
                />
              </FormGroup>

            </Layout>
          );
        }}
      </SaveDialog>
    );
  }
}

TagDialog.propTypes = {
  active: PropTypes.yesno,
  comment: PropTypes.string,
  fixed: PropTypes.bool,
  gmp: PropTypes.gmp.isRequired,
  name: PropTypes.string,
  resource_ids: PropTypes.arrayOf(PropTypes.id),
  resource_type: PropTypes.string,
  resource_types: PropTypes.array.isRequired,
  tag: PropTypes.model,
  title: PropTypes.string,
  value: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default withGmp(TagDialog);

// vim: set ts=2 sw=2 tw=80:
