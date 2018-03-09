/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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
import 'core-js/fn/string/includes';

import React from 'react';

import Downshift from 'downshift';

import {is_defined} from 'gmp/utils';

import PropTypes, {mayRequire} from '../../utils/proptypes.js';

import ArrowIcon from '../icon/arrowicon';

import Layout from '../../components/layout/layout';

import {
  Box,
  case_insensitive_filter,
  Input,
  Item,
  ItemContainer,
  Menu,
  option_items,
  SelectContainer,
  SelectedValue,
} from './selectelements.js';

const SelectValueValidator = (props, prop_name, component_name) => {
  const value = props[prop_name];
  const {items} = props;
  const item = find_item(items, value);

  if (is_defined(items) && is_defined(value) && !is_defined(item)) {
    if (items.length === 0) {
      return new Error('Invalid prop ' + prop_name + ' `' + value + '` for ' +
        component_name + ' component. items prop is empty.');
    }
    return new Error('Invalid prop ' + prop_name + ' `' + value + '` for ' +
      component_name + ' component. Prop ' + prop_name + ' can not be ' +
      'found in items `' + items + '`.');
  }
};

const selectValue = mayRequire(SelectValueValidator);

const find_item = (items, value) => is_defined(items) ?
  items.find(i => i.value === value) : undefined;

const find_label = (items, value) => {
  const item = find_item(items, value);
  if (is_defined(item)) {
    return item.label;
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

    if (is_defined(onChange)) {
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
    let {
      children,
      className,
      disabled = false,
      items,
      menuPosition,
      value,
      width = DEFAULT_WIDTH,
    } = this.props;

    const {
      search,
    } = this.state;

    if (!is_defined(items)) {
      items = option_items(children);
    }

    disabled = disabled || !is_defined(items) || items.length === 0;

    const displayedItems = is_defined(items) ?
      items.filter(case_insensitive_filter(search)) : [];

    return (
      <Downshift
        selectedItem={value}
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
                {...getButtonProps({
                  disabled,
                  onClick: isOpen ? undefined : event => {
                    event.preventDefault(); // don't call default handler from downshift
                    openMenu(() =>
                      is_defined(this.input) && this.input.focus()); // set focus to input field after menu is opened
                  },
                })}
                isOpen={isOpen}
                innerRef={ref => this.box = ref}
              >
                <SelectedValue
                  disabled={disabled}
                  title={label}
                >
                  {label}
                </SelectedValue>
                <Layout align={['center', 'center']}>
                  <ArrowIcon
                    disabled={disabled}
                    down={!isOpen}
                    size="small"
                  />
                </Layout>
              </Box>
              {isOpen && !disabled &&
                <Menu
                  position={menuPosition}
                  target={this.box}
                >
                  <Input
                    {...getInputProps({
                      value: search,
                      onChange: this.handleSearch,
                    })}
                    disabled={disabled}
                    innerRef={ref => this.input = ref}
                  />
                  <ItemContainer>
                    {displayedItems
                      .map(({label: itemLabel, value: itemValue}, i) => (
                        <Item
                          {...getItemProps({item: itemValue})}
                          isSelected={itemValue === selectedItem}
                          isActive={i === highlightedIndex}
                          key={itemValue}
                          onMouseDown={() => selectItem(itemValue)}
                        >
                          {itemLabel}
                        </Item>
                      ))
                    }
                  </ItemContainer>
                </Menu>
              }
            </SelectContainer>
          );
        }}
      />
    );
  }
}

Select.propTypes = {
  disabled: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
  menuPosition: PropTypes.oneOf(['left', 'right', 'adjust']),
  name: PropTypes.string,
  value: selectValue,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default Select;

// vim: set ts=2 sw=2 tw=80:
