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

import glamorous from 'glamorous';

import Downshift from 'downshift';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

const SelectContainer = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

const ArrowButton = glamorous.span({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
  margin: '1px',
}, ({disabled}) => disabled ? {cursor: 'not-allowed'} : null);

const ArrowIcon = ({down = true}) => (
  down ? '▲' : '▼'
);

ArrowIcon.propTypes = {
  down: PropTypes.bool,
};

const Input = glamorous.input({
  flexGrow: 1,
  padding: '1px',
  margin: '5px',
});

const Box = glamorous.div({
  border: '1px solid #aaa',
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  flexGrow: 1,
  padding: '1px 5px',
}, ({isOpen}) => isOpen ? {
  borderRadius: '4px 4px 0 0',
} : null, ({disabled}) => disabled ? {
  backgroundColor: '#eee',
} : null);

const Menu = glamorous.div({
  maxHeight: '20rem',
  overflowY: 'auto',
  overflowX: 'hidden',
  outline: '0',
  borderRadius: '0 0 4px 4px',
  transition: 'opacity .1s ease',
  boxShadow: '0 2px 3px 0 rgba(34,36,38,.15)',
  borderColor: '#96c8da',
  borderWidth: '0 1px 1px 1px',
  borderStyle: 'solid',
  position: 'absolute',
  top: '100%', // move below Box
  left: 0,
  display: 'flex',
  flexDirection: 'column',
});

const Item = glamorous.span({
  padding: '1px 5px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#5897fb',
    color: 'white',
  },
}, ({isSelected}) => isSelected ? {
  backgroundColor: '#ddd',
} : null, ({isActive}) => isActive ? {
  backgroundColor: '#5897fb',
  color: 'white',
} : null);

const SelectedValue = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  cursor: 'pointer',
}, ({disabled}) => disabled ? {
  cursor: 'default',
} : null);

const option_items = children => {
  children = React.Children.toArray(children);
  children = children.filter(child => child.type === 'option');
  return children.map(child => {
    const {props} = child;
    return {
      label: props.children,
      value: is_defined(props.value) ? props.value : props.children,
    };
  });
};

const case_insensitive_filter = search => {
  if (!is_defined(search) || search.length === 0) {
    return () => true;
  }
  search = search.toLowerCase();
  return ({label}) => ('' + label).toLowerCase().includes(search);
};

const find_label = (items, value) => {
  const item = items.find(i => i.value === value);
  return is_defined(item) ? item.label : value;
};

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
      value,
    } = this.props;
    const {
      search,
    } = this.state;

    if (!is_defined(items)) {
      items = option_items(children);
    }

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
            >
              <Box
                {...getButtonProps({
                  disabled,
                  onClick: isOpen ? undefined : event => {
                    event.preventDefault(); // don't call default handler from downshift
                    openMenu(() => this.input.focus()); // set focus to input field after menu is opened
                  },
                })}
                isOpen={isOpen}
              >
                <SelectedValue
                  disabled={disabled}
                >
                  {label}
                </SelectedValue>
                <ArrowButton
                  disabled={disabled}
                >
                  <ArrowIcon down={isOpen}/>
                </ArrowButton>
              </Box>
              {isOpen && items.length > 0 && !disabled &&
                <Menu>
                  <Input
                    {...getInputProps({
                      value: search,
                      onChange: this.handleSearch,
                    })}
                    disabled={disabled}
                    innerRef={ref => this.input = ref}
                  />
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
                    ))}
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
  name: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export default Select;

// vim: set ts=2 sw=2 tw=80:
