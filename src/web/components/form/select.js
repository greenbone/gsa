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

import Downshift from 'downshift';

import _ from 'gmp/locale';

import {isDefined, isArray} from 'gmp/utils/identity';

import PropTypes, {mayRequire} from 'web/utils/proptypes';

import ArrowIcon from 'web/components/icon/arrowicon';

import Layout from 'web/components/layout/layout';

import styled from 'styled-components';

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

const SingleSelectedValue = styled(SelectedValue)`
  cursor: default;
`;

const Div = styled.div`
  display: flex;
`;

const SelectValueValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  const {items} = props;
  const item = find_item(items, value);

  if (isArray(items) && isDefined(value) && !isDefined(item)) {
    if (items.length === 0) {
      return new Error(
        'Invalid prop ' +
          prop_name +
          ' `' +
          value +
          '` for ' +
          component_name +
          ' component. items prop is empty.',
      );
    }
    return new Error(
      'Invalid prop ' +
        prop_name +
        ' `' +
        value +
        '` for ' +
        component_name +
        ' component. Prop ' +
        prop_name +
        ' can not be ' +
        'found in items `' +
        items.map(i => i.value) +
        '`.',
    );
  }
};

const selectValue = mayRequire(SelectValueValidator);

const find_item = (items, value) =>
  isDefined(items) ? items.find(i => i.value === value) : undefined;

const find_label = (items, value) => {
  const item = find_item(items, value);
  if (isDefined(item)) {
    return React.isValidElement(item.label) ? item.label : `${item.label}`;
  }
  return value;
};

const DEFAULT_WIDTH = '180px';

class Select extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      search: '',
    };

    this.input = React.createRef();
    this.box = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleChange(value) {
    const {name, onChange} = this.props;

    if (isDefined(onChange)) {
      onChange(value, name);
    }
  }

  handleSearch(event) {
    const {value} = event.target;
    event.preventDefault(); // prevent handling input by downshift

    this.setState({search: value});
  }

  handleSelect() {
    // reset search term
    this.setState({search: ''});
  }

  render() {
    let {disabled = false} = this.props;
    const {
      className,
      errorContent,
      hasError = false,
      items,
      itemToString,
      menuPosition,
      value,
      toolTipTitle,
      width = DEFAULT_WIDTH,
      isLoading = false,
    } = this.props;

    const {search} = this.state;

    disabled = disabled || !isDefined(items) || items.length === 0 || isLoading;

    const displayedItems = isDefined(items)
      ? items.filter(caseInsensitiveFilter(search))
      : [];

    return (
      <Downshift
        selectedItem={value}
        itemToString={itemToString}
        stateReducer={(state, changes) => {
          if (isDefined(changes) && isDefined(changes.isOpen)) {
            return {
              ...changes,
              highlightedIndex: displayedItems.findIndex(
                item => item.value === state.selectedItem,
              ),
            };
          }
          return changes;
        }}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
      >
        {({
          closeMenu,
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
          selectedItem,
        }) => {
          const label = isLoading
            ? _('Loading...')
            : find_label(items, selectedItem);
          return (
            <Div {...getRootProps({})}>
              <SelectContainer className={className} width={width}>
                <Box
                  {...getToggleButtonProps({
                    disabled,
                    onClick: isOpen
                      ? event => {
                          closeMenu();
                        }
                      : event => {
                          event.preventDownshiftDefault = true; // don't call default handler from downshift
                          openMenu(() => {
                            const {current: input} = this.input;
                            input !== null && input.focus();
                          }); // set focus to input field after menu is opened
                        },
                  })}
                  hasError={hasError}
                  isOpen={isOpen}
                  title={hasError ? errorContent : toolTipTitle}
                  ref={this.box}
                >
                  <SingleSelectedValue
                    data-testid="select-selected-value"
                    disabled={disabled}
                    title={toolTipTitle ? toolTipTitle : label}
                  >
                    {label}
                  </SingleSelectedValue>
                  <Layout align={['center', 'center']}>
                    <ArrowIcon
                      data-testid="select-open-button"
                      down={!isOpen}
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
                        value: search,
                        disabled,
                        onChange: this.handleSearch,
                      })}
                      data-testid="select-search-input"
                      ref={this.input}
                    />
                    <ItemContainer>
                      {displayedItems.map(
                        (
                          {label: itemLabel, value: itemValue, key = itemValue},
                          i,
                        ) => (
                          <Item
                            {...getItemProps({
                              item: itemValue,
                              isSelected: itemValue === selectedItem,
                              isActive: i === highlightedIndex,
                              onClick: event => {
                                event.preventDownshiftDefault = true;
                                selectItem(itemValue);
                              },
                            })}
                            data-testid="select-item"
                            key={key}
                          >
                            {React.isValidElement(itemLabel)
                              ? itemLabel
                              : `${itemLabel}`}
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

Select.propTypes = {
  disabled: PropTypes.bool,
  errorContent: PropTypes.string,
  hasError: PropTypes.bool,
  isLoading: PropTypes.bool,
  itemToString: PropTypes.func,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.any.isRequired,
      value: PropTypes.any.isRequired,
      key: PropTypes.toString,
    }),
  ),
  menuPosition: PropTypes.oneOf(['left', 'right', 'adjust']),
  name: PropTypes.string,
  toolTipTitle: PropTypes.string,
  value: selectValue,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default Select;

// vim: set ts=2 sw=2 tw=80:
