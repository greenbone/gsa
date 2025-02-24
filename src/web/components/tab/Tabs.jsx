/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React, {useEffect, useState} from 'react';
import TabList from 'web/components/tab/TabList';
import TabPanels from 'web/components/tab/TabPanels';
import PropTypes from 'web/utils/PropTypes';

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
