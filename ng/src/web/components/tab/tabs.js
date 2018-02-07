/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import React from 'react';

import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import Wrapper from '../layout/wrapper.js';

import TabPanels from './tabpanels.js';
import TabList from './tablist.js';

/*
 * Tabs and its sub components are using the "compound components" pattern
 *
 * A detailed explanation of this pattern can bee seen at
 * https://www.youtube.com/watch?v=hEGg-3pIHlE
 */

class Tabs extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {
      active: is_defined(this.props.active) ? this.props.active : 0,
    };

    this.handleActivateTab = this.handleActivateTab.bind(this);
  }

  componentWillReceiveProps(next) {
    const {active} = next;

    if (active !== this.props.active) {
      this.setActiveTab(active);
    }
  }

  setActiveTab(index) {
    this.setState({
      active: index,
    });
  }

  handleActivateTab(index) {
    this.setActiveTab(index);
  }

  render() {
    const {active} = this.state;
    const children = React.Children.map(this.props.children, child => {
      if (child.type === TabPanels) {
        return React.cloneElement(child, {active});
      }
      else if (child.type === TabList) {
        return React.cloneElement(child, {
          active,
          onActivateTab: this.handleActivateTab,
        });
      }
      return child;
    });
    return (
      <Wrapper>
        {children}
      </Wrapper>
    );
  }
}

Tabs.propTypes = {
  active: PropTypes.number,
};

export default Tabs;

// vim: set ts=2 sw=2 tw=80:
