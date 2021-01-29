/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import React, {useEffect, useState} from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import TabPanels from './tabpanels';
import TabList from './tablist';

/*
 * Tabs and its sub components are using the "compound components" pattern
 *
 * A detailed explanation of this pattern can bee seen at
 * https://www.youtube.com/watch?v=hEGg-3pIHlE
 */

const Tabs = props => {
  const [active, setActive] = useState(
    isDefined(props.active) ? props.active : 0,
  );

  const setActiveTab = index => {
    setActive(index);
  };

  useEffect(() => {
    setActiveTab(props.active);
  }, [props.active]);

  const handleActivateTab = index => {
    setActiveTab(index);
  };

  const children = React.Children.map(props.children, child => {
    if (child.type === TabPanels) {
      return React.cloneElement(child, {active});
    } else if (child.type === TabList) {
      return React.cloneElement(child, {
        active,
        onActivateTab: handleActivateTab,
      });
    }
    return child;
  });
  return <React.Fragment>{children}</React.Fragment>;
};

Tabs.propTypes = {
  active: PropTypes.number,
};

export default Tabs;

// vim: set ts=2 sw=2 tw=80:
