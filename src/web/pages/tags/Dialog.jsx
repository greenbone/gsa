/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {YES_VALUE} from 'gmp/parser';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import React from 'react';
import styled from 'styled-components';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextArea';
import YesNoRadio from 'web/components/form/YesNoRadio';
import withTranslation from 'web/hooks/withTranslation';
import {SELECT_MAX_RESOURCES} from 'web/pages/tags/Component';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems} from 'web/utils/Render';
import withGmp from 'web/utils/withGmp';

const Divider = styled.div`
  margin: 0 5px;
`;

const ScrollableContent = styled.div`
  max-height: 200px;
  overflow: auto;
`;

const types = {
  auditreport: 'audit_report',
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

  handleIdChangeByText(id) {
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
    const {_} = this.props;

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
        defaultValues={data}
        title={title}
        values={controlledData}
        onClose={onClose}
        onSave={onSave}
      >
        {({values: state, onValueChange}) => {
          return (
            <>
              <FormGroup title={_('Name')}>
                <TextField
                  name="name"
                  value={state.name}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={state.comment}
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Value')}>
                <TextField
                  name="value"
                  value={state.value}
                  onChange={onValueChange}
                />
              </FormGroup>

              {showResourceSelection && (
                <FormGroup title={_('Resource Type')}>
                  <Select
                    disabled={fixed || resourceTypesOptions.length === 0}
                    items={resourceTypesOptions}
                    name="resource_type"
                    value={this.state.resourceType}
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
                      disabled={
                        !typeIsChosen ||
                        fixed ||
                        resourceTypesOptions.length === 0
                      }
                      isLoading={
                        this.state.isLoading &&
                        this.state.resourceOptions.length === 0
                      }
                      items={renderSelectItems(this.state.resourceOptions)}
                      name="resource_ids"
                      value={this.state.resourceIdsSelected}
                      onChange={ids => this.handleIdChange(ids, onValueChange)}
                    />
                  </ScrollableContent>
                  <Divider>{_('or add by ID:')}</Divider>
                  <TextField
                    disabled={!typeIsChosen || fixed}
                    name="resource_id_text"
                    value={this.state.resourceIdText}
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
            </>
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
  _: PropTypes.func.isRequired,
};

export default withGmp(withTranslation(TagDialog));
