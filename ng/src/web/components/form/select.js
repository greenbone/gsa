/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import {
  ArrowButton,
  ArrowIcon,
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

const find_label = (items, value) => {
  const item = items.find(i => i.value === value);
  return is_defined(item) ? item.label : value;
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

    disabled = disabled || items.length === 0;

    const displayedItems = items.filter(case_insensitive_filter(search));
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
              >
                <SelectedValue
                  disabled={disabled}
                  title={label}
                >
                  {label}
                </SelectedValue>
                <ArrowButton
                  disabled={disabled}
                >
                  <ArrowIcon down={isOpen}/>
                </ArrowButton>
              </Box>
              {isOpen && !disabled &&
                <Menu position={menuPosition}>
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
  value: PropTypes.any,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default Select;

// vim: set ts=2 sw=2 tw=80:
