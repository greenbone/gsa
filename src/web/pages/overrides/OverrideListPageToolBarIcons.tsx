/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface OverrideListPageToolBarIconsProps {
  onOverrideCreateClick: () => void;
}

const OverrideListPageToolBarIcons = ({
  onOverrideCreateClick,
}: OverrideListPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-overrides"
        page="reports"
        title={_('Help: Overrides')}
      />
      {capabilities.mayCreate('override') && (
        <NewIcon title={_('New Override')} onClick={onOverrideCreateClick} />
      )}
    </IconDivider>
  );
};

export default OverrideListPageToolBarIcons;
