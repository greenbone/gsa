/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {map} from 'gmp/utils/array';
import {isEmpty} from 'gmp/utils/string';

import {YES_VALUE} from 'gmp/parser';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import YesNoRadio from 'web/components/form/yesnoradio';

import Layout from 'web/components/layout/layout';

import {SELECT_MAX_RESOURCES} from 'web/pages/tags/component';

const Divider = styled.div`
  margin: 0 5px;
`;

const ScrollableContent = styled.div`
  max-height: 200px;
  overflow: auto;
`;

const types = {
  operatingsystem: 'os',
  certbund: 'cert_bund_adv',
  dfncert: 'dfn_cert_adv',
  portlist: 'port_list',
  reportconfig: 'report_config',
  reportformat: 'report_format',
  scanconfig: 'config',
  tlscertificate: 'tls_certificate',
};

const convertType = type => {
  const ctype = types[type];
  if (isDefined(ctype)) {
    return ctype;
  }
  return type;
};

class TagDialog extends React.Component {
  constructor(...args) {
    super(...args);

    const {resource_ids = []} = this.props;

    this.state = {
      resourceIdText: '',
      resourceIdsSelected: resource_ids,
      resourceOptions: [],
      resourceType: this.props.resource_type,
      isLoading: false,
    };
  }

  componentDidMount() {
    const {resourceType} = this.state;

    if (isDefined(resourceType)) {
      this.loadResourcesByType(resourceType);
    }
  }

  loadResourcesByType(type) {
    if (!isDefined(type)) {
      return;
    }
    const {gmp} = this.props;
    this.setState({
      isLoading: true,
    });
    gmp.resourcenames
      .getAll({resource_type: convertType(type)})
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
          isLoading: false,
        });
      })
      .catch(err => {
        this.setState({
          isLoading: false,
        });
        throw err;
      });
  }

  handleResourceTypeChange(type, onValueChange) {
    onValueChange(type, 'resource_type');

    this.loadResourcesByType(type);
    this.setState({
      resourceIdsSelected: [],
      resourceOptions: [],
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
    const {resourceIdsSelected, resourceType} = this.state;

    gmp.resourcenames
      .get({resource_type: convertType(resourceType), filter: 'uuid=' + id})
      .then(response => {
        const ids = isDefined(resourceIdsSelected) ? resourceIdsSelected : [];
        if (response.data.length === 0) {
          let {resourceOptions} = this.state;
          const idPresent = resourceOptions.filter(res => res.id === id);
          if (idPresent.length === 0 && !isEmpty(id)) {
            // if the options already contain '----', remove the old element
            resourceOptions = resourceOptions.filter(
              res => res.name !== '----',
            );
            resourceOptions.push({
              name: '----',
              id: id,
            });
          }

          this.setState({
            resourceOptions,
            resourceIdText: id,
          });
        } else {
          const idSelected = ids.includes(id);
          if (idSelected) {
            this.setState({
              resourceIdText: '',
            });
          } else {
            this.setState(prevState => {
              const prevResourceIdsSelected = prevState.resourceIdsSelected;
              return {
                resourceIdsSelected: [...prevResourceIdsSelected, id],
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
      resourceCount = 0,
      resource_types = [],
      title = _('New Tag'),
      value = '',
      gmp,
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
    const showResourceSelection = resourceCount < SELECT_MAX_RESOURCES;

    const controlledData = {
      resource_ids: this.state.resourceIdsSelected,
      resource_type: this.state.resourceType,
    };

    return (
      <SaveDialog
        title={title}
        onClose={onClose}
        onSave={onSave}
        defaultValues={data}
        values={controlledData}
      >
        {({values: state, onValueChange}) => {
          return (
            <Layout flex="column">
              <FormGroup title={_('Name')}>
                <TextField
                  name="name"
                  grow="1"
                  value={state.name}
                  size="30"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  grow="1"
                  size="30"
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

              {showResourceSelection && (
                <FormGroup title={_('Resource Type')}>
                  <Select
                    name="resource_type"
                    items={resourceTypesOptions}
                    value={this.state.resourceType}
                    disabled={fixed || resourceTypesOptions.length === 0}
                    onChange={type =>
                      this.handleResourceTypeChange(type, onValueChange)
                    }
                  />
                </FormGroup>
              )}
              {showResourceSelection && (
                <FormGroup title={_('Resources')}>
                  <ScrollableContent className="multiselect-scroll">
                    <MultiSelect
                      name="resource_ids"
                      items={renderSelectItems(this.state.resourceOptions)}
                      value={this.state.resourceIdsSelected}
                      disabled={
                        !typeIsChosen ||
                        fixed ||
                        resourceTypesOptions.length === 0
                      }
                      isLoading={
                        this.state.isLoading &&
                        this.state.resourceOptions.length === 0
                      }
                      onChange={ids => this.handleIdChange(ids, onValueChange)}
                    />
                  </ScrollableContent>
                  <Divider>{_('or add by ID:')}</Divider>
                  <TextField
                    name="resource_id_text"
                    value={this.state.resourceIdText}
                    grow="1"
                    disabled={!typeIsChosen || fixed}
                    onChange={id =>
                      this.handleIdChangeByText(id, onValueChange)
                    }
                  />
                </FormGroup>
              )}
              {!showResourceSelection && (
                <FormGroup title={_('Resources')}>
                  <span>{_('Too many resources to list.')}</span>
                </FormGroup>
              )}
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
  resourceCount: PropTypes.number,
  resource_ids: PropTypes.arrayOf(PropTypes.id),
  resource_type: PropTypes.string,
  resource_types: PropTypes.array.isRequired,
  tag: PropTypes.model,
  title: PropTypes.string,
  value: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onValueChange: PropTypes.func,
};

export default withGmp(TagDialog);

// vim: set ts=2 sw=2 tw=80:
