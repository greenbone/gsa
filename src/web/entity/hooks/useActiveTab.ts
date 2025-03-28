/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useState} from 'react';

interface UseActiveTabProps {
  onInteraction?: () => void;
}

const useActiveTab = ({onInteraction}: UseActiveTabProps = {}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleActivateTab = (index: number) => {
    setActiveTab(index);

    if (index !== activeTab && isDefined(onInteraction)) {
      onInteraction();
    }
  };
  return [activeTab, handleActivateTab] as const;
};

export default useActiveTab;
