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

import styled from 'styled-components';

import Downshift from 'downshift';

import {arraysEqual} from 'gmp/utils/array';
import {isDefined, isArray} from 'gmp/utils/identity';

import ArrowIcon from 'web/components/icon/arrowicon';

import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';

import Theme from 'web/utils/theme';

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
} from './selectelements';

const DEFAULT_WIDTH = '250px';

export const MultiSelectedValue = styled(SelectedValue)`
  display: inline;
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 3px;
  padding: 0 3px;
  margin-right: 4px;
  margin-top: 1px;
  margin-bottom: 1px;
  background-color: ${Theme.lightGray};
  width: 80px; /* acts similar to minWidth? */
`;

const DeleteButton = styled.div`
  display: inline;
  color: ${Theme.mediumGray};
  margin-right: 2px;
  &:hover {
    color: ${Theme.black};
  };
`;

const Label = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`;

class MultiSelect extends React.Component {

  constructor(...args) {
    super(...args);

    const {value} = this.props;

    this.state = {
      search: '',
      selectedItems: isArray(value) ? value : [],
    };

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

    if (isDefined(value) && !arraysEqual(value, this.state.selectedItems)) {
      this.setState({selectedItems: value});
    }
  }

  renderItem(value, items) {
    const {disabled} = this.props;
    const item = items.find(i => i.value === value);
    const itemLabel = isDefined(item) ? item.label : value;

    return (
      <MultiSelectedValue
        title={itemLabel}
        key={value}
      >
        <Layout>
          <DeleteButton
            onClick={disabled ? undefined : () => this.handleRemoveItem(value)}
          >
            × {/* Javascript unicode: \u00D7 */}
          </DeleteButton>
          <Label>{itemLabel}</Label>
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

    if (!isDefined(items)) {
      items = option_items(children);
    }

    disabled = disabled || !isDefined(items) || items.length === 0;

    const displayedItems = isDefined(items) ?
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
          selectItem,
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
                innerRef={ref => this.box = ref}
              >
                <Layout grow wrap="wrap">
                  {selectedItems.map(item => this.renderItem(item, items))}
                </Layout>
                <Layout align={['center', 'center']}>
                  <ArrowIcon
                    {...getButtonProps({
                      disabled,
                      down: !isOpen,
                      onClick: isOpen ? undefined : event => {
                        event.preventDefault(); // don't call default handler from downshift
                        openMenu(() =>
                          isDefined(this.input) && this.input.focus()); // set focus to input field after menu is opened
                      },
                    })}
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
                          isSelected={selectedItems.includes(itemValue)}
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
