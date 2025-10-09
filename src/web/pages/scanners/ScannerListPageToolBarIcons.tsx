/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {NewIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface ScannerListPageToolBarIconsProps {
  onScannerCreateClick: () => void;
}

const ScannerListPageToolBarIcons = ({
  onScannerCreateClick,
}: ScannerListPageToolBarIconsProps) => {
  const gmp = useGmp();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const [_] = useTranslation();
  const showNewScannerIcon =
    capabilities.mayCreate('scanner') &&
    (gmp.settings.enableGreenboneSensor ||
      features.featureEnabled('ENABLE_AGENTS'));
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-scanners"
        page="scanning"
        title={_('Help: Scanners')}
      />
      {showNewScannerIcon && (
        <NewIcon
          title={_('New Scanner')}
          onClick={() => onScannerCreateClick && onScannerCreateClick()}
        />
      )}
    </IconDivider>
  );
};

export default ScannerListPageToolBarIcons;
