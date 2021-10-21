/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import Downshift from 'downshift';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import ArrowIcon from 'web/components/icon/arrowicon';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

import {
  Box,
  caseInsensitiveFilter,
  Input,
  Item,
  ItemContainer,
  Menu,
  SelectContainer,
  SelectedValue,
} from './selectelements';

import {Marker} from './useFormValidation';

const DEFAULT_WIDTH = '250px';

const Div = styled.div`
  display: flex;
`;

export const MultiSelectedValue = styled(SelectedValue)`
  display: inline;
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 2px;
  padding: 0 3px;
  margin-right: 4px;
  margin-top: 1px;
  margin-bottom: 0px;
  background-color: ${Theme.lightGray};
  width: 80px; /* acts similar to minWidth? */
`;

const DeleteButton = styled.div`
  display: inline;
  color: ${Theme.mediumGray};
  margin-right: 2px;
  &:hover {
    color: ${Theme.black};
  }
`;

const Label = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`;

class MultiSelect extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      search: '',
    };

    this.input = React.createRef();
    this.box = React.createRef();

    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  notifyChange(value) {
    const {name, onChange} = this.props;

    if (isDefined(onChange)) {
      onChange(value, name);
    }
  }

  handleSearch(event) {
    const {value} = event.target;
    event.preventDefault(); // prevent input by downshift

    this.setState({search: value});
  }

  handleSelect(selectedItem) {
    const {value} = this.props;

    let newSelectedItems = [];

    if (isDefined(value)) {
      if (value.includes(selectedItem)) {
        this.handleRemoveItem(selectedItem);
        return;
      }

      newSelectedItems = [...value, selectedItem];
    } else {
      newSelectedItems = [selectedItem];
    }

    this.setState({
      // reset search term
      search: '',
    });

    this.notifyChange(newSelectedItems);
  }

  handleRemoveItem(item) {
    const copy = [...this.props.value];
    const index = copy.findIndex(elem => elem === item);

    copy.splice(index, 1);

    this.notifyChange(copy);
  }

  renderItem(value, items) {
    const {disabled} = this.props;
    const item = items.find(i => i.value === value);
    const itemLabel = isDefined(item) ? item.label : value;

    return (
      <MultiSelectedValue title={itemLabel} key={value}>
        <Layout>
          <DeleteButton
            data-testid="multiselect-selected-delete"
            onClick={disabled ? undefined : () => this.handleRemoveItem(value)}
          >
            × {/* Javascript unicode: \u00D7 */}
          </DeleteButton>
          <Label data-testid="multiselect-selected-label">{itemLabel}</Label>
        </Layout>
      </MultiSelectedValue>
    );
  }

  render() {
    let {disabled = false} = this.props;
    const {
      className,
      hasError = false,
      errorContent,
      items,
      menuPosition = 'adjust',
      width = DEFAULT_WIDTH,
      grow,
      isLoading = false,
      title,
      value = [],
    } = this.props;

    const {search} = this.state;

    disabled = disabled || !isDefined(items) || items.length === 0 || isLoading;

    const displayedItems = isDefined(items)
      ? items.filter(caseInsensitiveFilter(search))
      : [];

    return (
      <Downshift
        selectedItem={value}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          getRootProps,
          getToggleButtonProps,
          highlightedIndex,
          inputValue,
          isOpen,
          openMenu,
          selectItem,
        }) => {
          return (
            <Div {...getRootProps({})}>
              <SelectContainer className={className} width={width} grow={grow}>
                <Box
                  isOpen={isOpen}
                  hasError={hasError}
                  disabled={disabled}
                  title={hasError ? errorContent : title}
                  ref={this.box}
                >
                  <Layout grow="1" wrap>
                    {isLoading
                      ? _('Loading...')
                      : value.map(item => this.renderItem(item, items))}
                  </Layout>
                  <Layout align={['center', 'center']}>
                    <ArrowIcon
                      {...getToggleButtonProps({
                        disabled,
                        down: !isOpen,
                        onClick: isOpen
                          ? undefined
                          : event => {
                              event.preventDownshiftDefault = true; // don't call default handler from downshift
                              openMenu(() => {
                                const {current: input} = this.input;
                                input !== null && input.focus();
                              });
                            },
                      })}
                      size="small"
                      isLoading={isLoading}
                    />
                  </Layout>
                </Box>
                {isOpen && !disabled && (
                  <Menu
                    {...getMenuProps({})}
                    position={menuPosition}
                    target={this.box}
                  >
                    <Input
                      {...getInputProps({
                        disabled,
                        value: search,
                        onChange: this.handleSearch,
                      })}
                      ref={this.input}
                      data-testid="multiselect-input"
                    />
                    <ItemContainer>
                      {displayedItems.map(
                        ({label: itemLabel, value: itemValue}, i) => (
                          <Item
                            {...getItemProps({
                              item: itemValue,
                              isSelected: value.includes(itemValue),
                              isActive: i === highlightedIndex,
                              onClick: event => {
                                event.preventDownshiftDefault = true;
                                selectItem(itemValue);
                              },
                            })}
                            data-testid="multiselect-item-label"
                            key={itemValue}
                          >
                            {itemLabel}
                          </Item>
                        ),
                      )}
                    </ItemContainer>
                  </Menu>
                )}
              </SelectContainer>
              <Marker isVisible={hasError}>×</Marker>
            </Div>
          );
        }}
      </Downshift>
    );
  }
}

MultiSelect.propTypes = {
  disabled: PropTypes.bool,
  errorContent: PropTypes.string,
  grow: PropTypes.number,
  hasError: PropTypes.bool,
  isLoading: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
  menuPosition: PropTypes.oneOf(['left', 'right', 'adjust']),
  name: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.array,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default MultiSelect;

// vim: set ts=2 sw=2 tw=80:
