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

import glamorous from 'glamorous';

import {is_defined, has_value} from 'gmp/utils';

import Theme from '../../utils/theme';
import PropTypes from '../../utils/proptypes';

import Portal from '../../components/portal/portal';

export const Box = glamorous.div({
  border: '1px solid ' + Theme.inputBorderGray,
  borderRadius: '4px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  flexGrow: 1,
  padding: '1px 5px',
  backgroundColor: Theme.white,
}, ({isOpen}) => isOpen ? {
  borderRadius: '4px 4px 0 0',
} : null, ({disabled}) => disabled ? {
  backgroundColor: Theme.dialogGray,
} : null);

export const Input = glamorous.input({
  flexGrow: 1,
  padding: '1px',
  margin: '5px',

  /* use font and line settings from parents not from browser default */
 fontFamily: 'inherit',
 fontSize: 'inherit',
 lineHeight: 'inherit',
});

export const Item = glamorous.span({
  padding: '1px 5px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: Theme.mediumBlue,
    color: 'white',
  },
}, ({isSelected}) => isSelected ? {
  backgroundColor: Theme.lightGray,
} : null, ({isActive}) => isActive ? {
  backgroundColor: Theme.mediumBlue,
  color: Theme.white,
} : null);

export const ItemContainer = glamorous.div({
  maxHeight: '320px',
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const MenuContainer = glamorous.div({
  outline: '0',
  borderRadius: '0 0 4px 4px',
  transition: 'opacity .1s ease',
  boxShadow: '0 2px 3px 0 rgba(34,36,38,.15)',
  borderColor: Theme.inputBorderGray,
  borderWidth: '1px 1px 1px 1px',
  borderStyle: 'solid',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  zIndex: Theme.Layers.onTop,
  marginTop: '-1px', // collapse top border
  boxSizing: 'border-box',
}, ({
  position,
  right,
  width,
  x,
  y,
}) => {
  switch (position) {
    case 'adjust':
      return {
        top: y,
        left: x,
        width,
      };
    case 'right':
      return {
        top: y,
        right,
        whiteSpace: 'nowrap',
      };
    default:
      return {
        top: y,
        left: x,
        whiteSpace: 'nowrap',
      };
  }
});

const getParentNode = element => {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode;
};

const getStyleComputedProperty = (element, property) => {
  if (element.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }
  const css = getComputedStyle(element);
  return property ? css[property] : css;
};

const getScrollParent = element => {
  if (!has_value(element)) {
    return document.body;
  }

  if (element.nodeName === 'HTML' || element.nodeName === 'BODY') {
    return element.ownerDocument.body;
  }

  if (element.nodeName === '#document') {
    return element.body;
  }

  const {overflow, overflowX, overflowY} = getStyleComputedProperty(element);
  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
};

const getScrollX = () => is_defined(window.scrollX) ?
  window.scrollX : window.pageXOffset;

const getScrollY = () => is_defined(window.scrollY) ?
  window.scrollY : window.pageYOffset;

export class Menu extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll() {
    this.forceUpdate();
  }

  componentDidMount() {
    const {target} = this.props;

    this.eventTarget = getScrollParent(target);

    this.eventTarget.addEventListener('scroll', this.handleScroll,
      {passive: true});

    if (this.eventTarget !== window) {
      window.addEventListener('scroll', this.handleScroll, {passive: true});
    }

  }

  componentWillUnmount() {
    this.eventTarget.removeEventListener('scroll', this.handleScroll);

    if (this.eventTarget !== window) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  render() {
    const {
      target,
      ...props
    } = this.props;

    if (!is_defined(target)) {
      return null;
    }

    const rect = target.getBoundingClientRect();
    const {height, width, right, left, top} = rect;

    return (
      <Portal>
        <MenuContainer
          {...props}
          right={document.body.clientWidth - right}
          width={width}
          x={left + getScrollX()}
          y={top + getScrollY() + height}
        />
      </Portal>
    );
  }
}

Menu.propTypes = {
  target: PropTypes.object.isRequired,
};

export const SelectContainer = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}, ({width}) => ({
  width,
}));

export const SelectedValue = glamorous.div({
  display: 'flex',
  alignItems: 'center',
  flexGrow: 1,
  cursor: 'pointer',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}, ({disabled}) => disabled ? {
  cursor: 'default',
} : null);

export const case_insensitive_filter = search => {
  if (!is_defined(search) || search.length === 0) {
    return () => true;
  }
  search = search.toLowerCase();
  return ({label}) => ('' + label).toLowerCase().includes(search);
};

export const option_items = children => {
  if (!is_defined(children)) {
    return undefined;
  }

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

// vim: set ts=2 sw=2 tw=80:
