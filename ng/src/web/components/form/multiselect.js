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

import 'core-js/fn/string/includes';

import React from 'react';

import glamorous from 'glamorous';

import Downshift from 'downshift';

import {arrays_equal, is_array, is_defined, is_empty} from 'gmp/utils.js';

import Layout from '../layout/layout.js';

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

const DEFAULT_WIDTH = '250px';

export const MultiSelectedValue = glamorous(SelectedValue)({
  display: 'inline',
  border: '1px solid #aaa',
  borderRadius: '3px',
  padding: '0 3px',
  marginRight: '4px',
  marginTop: '1px',
  marginBottom: '1px',
  backgroundColor: '#ddd',
  width: '80px', // acts similar to minWidth?
});

const DeleteButton = glamorous.div({
  display: 'inline',
  color: '#888',
  marginRight: '2px',
  '&:hover': {
    color: '#000',
  },
});

class MultiSelect extends React.Component {

  constructor(...args) {
    super(...args);

    const {value} = this.props;

    this.state = {
      search: '',
      selectedItems: is_array(value) ? value : [],
    };

    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  notifyChange(value) {
    const {name, onChange} = this.props;

    if (is_defined(onChange)) {
      onChange(value, name);
    }
  }

  handleSearch(event) {
    const {value} = event.target;
    event.preventDefault(); // prevent input by downshift

    this.setState({search: value});
  }

  handleSelect(selectedItem) {
    const {selectedItems} = this.state;

    if (selectedItems.includes(selectedItem)) {
      this.handleRemoveItem(selectedItem);
      return;
    }

    const newSelectedItems = [...this.state.selectedItems, selectedItem];

    this.setState({
      // add item
      selectedItems: newSelectedItems,
      // reset search term
      search: '',
    });

    this.notifyChange(newSelectedItems);
  }

  handleRemoveItem(item) {
    const copy = [...this.state.selectedItems];
    const index = copy.findIndex(elem => elem === item);

    copy.splice(index, 1);

    this.setState({
      selectedItems: copy,
    });

    this.notifyChange(copy);
  }

  componentWillReceiveProps(nextProps) {
    const {value} = nextProps;

    if (is_defined(value) && !arrays_equal(value, this.state.selectedItems)) {
      this.setState({selectedItems: value});
    }
  }

  renderItem(value, items) {
    const {disabled} = this.props;
    const item = items.find(i => i.value === value);
    const itemLabel = is_defined(item) ? item.label : value;

    return (
      <MultiSelectedValue
        title={itemLabel}
        key={value}
      >
        <Layout>
          <DeleteButton
            onClick={!disabled && (() => this.handleRemoveItem(value))}
          >
            × {/* Javascript unicode: \u00D7 */}
          </DeleteButton>
          <span>{itemLabel}</span>
        </Layout>
      </MultiSelectedValue>
    );
  }

  render() {
    let {
      children,
      className,
      disabled = false,
      items,
      menuPosition = 'adjust',
      width = DEFAULT_WIDTH,
    } = this.props;
    const {
      search,
      selectedItems,
    } = this.state;

    if (!is_defined(items)) {
      items = option_items(children);
    }

    const displayedItems = is_defined(items) ?
      items.filter(case_insensitive_filter(search)) : [];
    return (
      <Downshift
        selectedItem={selectedItems}
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
        }) => {
          return (
            <SelectContainer
              {...getRootProps({refKey: 'innerRef'})}
              className={className}
              flex="column"
              width={width}
            >
              <Box
                isOpen={isOpen}
                disabled={disabled}
              >
                <Layout grow="1" wrap>
                  {!is_empty(selectedItems) && selectedItems.map(
                      item => this.renderItem(item, items)
                    )
                  }
                </Layout>
                <ArrowButton
                  {...getButtonProps({
                    disabled,
                    onClick: isOpen ? undefined : event => {
                      event.preventDefault(); // don't call default handler from downshift
                      openMenu(() => this.input.focus()); // set focus to input field after menu is opened
                    },
                  })}
                >
                  <ArrowIcon down={isOpen}/>
                </ArrowButton>
              </Box>
              {isOpen && items.length > 0 && !disabled &&
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
                          isSelected={selectedItems.includes(itemValue)}
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

MultiSelect.propTypes = {
  disabled: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object),
  menuPosition: PropTypes.oneOf(['left', 'right', 'adjust']),
  name: PropTypes.string,
  value: PropTypes.array,
  width: PropTypes.string,
  onChange: PropTypes.func,
};

export default MultiSelect;

// vim: set ts=2 sw=2 tw=80:
