/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import 'core-js/fn/string/includes';

import React from 'react';

import Downshift from 'downshift';

import {isDefined, isArray} from 'gmp/utils/identity';

import PropTypes, {mayRequire} from '../../utils/proptypes.js';

import ArrowIcon from '../icon/arrowicon';

import Layout from '../../components/layout/layout';

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
} from './selectelements.js';

const SingleSelectedValue = styled(SelectedValue)`
  cursor: default;
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
      items,
      itemToString,
      menuPosition,
      value,
      toolTipTitle,
      width = DEFAULT_WIDTH,
    } = this.props;

    const {search} = this.state;

    disabled = disabled || !isDefined(items) || items.length === 0;

    const displayedItems = isDefined(items)
      ? items.filter(caseInsensitiveFilter(search))
      : [];

    return (
      <Downshift
        selectedItem={value}
        itemToString={itemToString}
        onChange={this.handleChange}
        onSelect={this.handleSelect}
        render={({
          getButtonProps,
          getInputProps,
          getItemProps,
          getRootProps,
          highlightedIndex,
          inputValue,
          isOpen,
          openMenu,
          selectItem,
          selectedItem,
        }) => {
          const label = find_label(items, selectedItem);
          return (
            <SelectContainer
              {...getRootProps({refKey: 'innerRef'})}
              className={className}
              flex="column"
              width={width}
            >
              <Box
                isOpen={isOpen}
                title={toolTipTitle}
                innerRef={ref => (this.box = ref)}
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
                    {...getButtonProps({
                      disabled,
                      onClick: isOpen
                        ? undefined
                        : event => {
                            event.preventDefault(); // don't call default handler from downshift
                            openMenu(
                              () => isDefined(this.input) && this.input.focus(),
                            ); // set focus to input field after menu is opened
                          },
                    })}
                    data-testid="select-open-button"
                    disabled={disabled}
                    down={!isOpen}
                    size="small"
                  />
                </Layout>
              </Box>
              {isOpen && !disabled && (
                <Menu position={menuPosition} target={this.box}>
                  <Input
                    {...getInputProps({
                      value: search,
                      onChange: this.handleSearch,
                    })}
                    disabled={disabled}
                    innerRef={ref => (this.input = ref)}
                  />
                  <ItemContainer>
                    {displayedItems.map(
                      (
                        {label: itemLabel, value: itemValue, key = itemValue},
                        i,
                      ) => (
                        <Item
                          {...getItemProps({item: itemValue})}
                          data-testid="select-item"
                          isSelected={itemValue === selectedItem}
                          isActive={i === highlightedIndex}
                          key={key}
                          onMouseDown={() => selectItem(itemValue)}
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
          );
        }}
      />
    );
  }
}

Select.propTypes = {
  disabled: PropTypes.bool,
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
