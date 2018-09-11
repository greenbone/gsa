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

import styled from 'styled-components';

import {isDefined, hasValue} from 'gmp/utils/identity';

import Theme from 'web/utils/theme';
import PropTypes from 'web/utils/proptypes';

import Portal from 'web/components/portal/portal';

export const Box = styled.div`
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex-grow: 1;
  padding: 1px 5px;
  background-color: ${Theme.white};
  color: ${Theme.black};
  font-weight: normal;
  border-radius: ${props => props.isOpen ? '4px 4px 0 0' : null};
  background-color: ${props => props.disabled ? Theme.dialogGray : null};
`;

export const Input = styled.input`
  flex-grow: 1;
  padding: 1px;
  margin: 5px;

  /* use font and line settings from parents not from browser default */
 font-family: inherit;
 font-size: inherit;
 line-height: inherit;
`;

export const Item = styled.span`
  padding: 1px 5px;
  cursor: pointer;
  &:hover {
    background-color: ${Theme.mediumBlue};
    color: ${Theme.white};
  };
  background-color: ${props => props.isSelected ? Theme.lightGray : null};
  {$props => props.isActive ?
    {
      backgroundColor: Theme.mediumBlue,
      color: Theme.white,
    } : null;
  };
`;

export const ItemContainer = styled.div`
  max-height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const MenuContainer = styled.div`
  outline: 0;
  border-radius: 0 0 4px 4px;
  transition: opacity .1s ease;
  box-shadow: 0 2px 3px 0 rgba(34,36,38,.15);
  border: 1px solid ${Theme.inputBorderGray};
  background-color: ${Theme.white};
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: ${Theme.Layers.onTop};
  margin-top: -1px; /* collapse top border */
  box-sizing: border-box;
  top: ${props => props.y}px;
  ${props => {
    switch (props.position) {
      case 'adjust':
        return {
          left: props.x + 'px',
          width: props.width + 'px',
        };
      case 'right':
        return {
          right: props.right + 'px',
          whiteSpace: 'nowrap',
        };
      default:
        return {
          left: props.x + 'px',
          whiteSpace: 'nowrap',
        };
    }
  }};
`;

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
  if (!hasValue(element)) {
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

const getScrollX = () => isDefined(window.scrollX) ?
  window.scrollX : window.pageXOffset;

const getScrollY = () => isDefined(window.scrollY) ?
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

    if (!isDefined(target)) {
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

export const SelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${props => props.width};
`;

export const SelectedValue = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
`;

export const case_insensitive_filter = search => {
  if (!isDefined(search) || search.length === 0) {
    return () => true;
  }
  search = search.toLowerCase();
  return ({label}) => ('' + label).toLowerCase().includes(search);
};

export const option_items = children => {
  if (!isDefined(children)) {
    return undefined;
  }

  children = React.Children.toArray(children);
  children = children.filter(child => child.type === 'option');
  return children.map(child => {
    const {props} = child;
    return {
      label: props.children,
      value: isDefined(props.value) ? props.value : props.children,
    };
  });
};

// vim: set ts=2 sw=2 tw=80:
