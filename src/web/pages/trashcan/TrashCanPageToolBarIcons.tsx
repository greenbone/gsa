/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import ManualIcon from 'web/components/icon/ManualIcon';
import useTranslation from 'web/hooks/useTranslation';

const TrashCanPageToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <ManualIcon
      anchor="using-the-trashcan"
      page="web-interface"
      title={_('Help: Trashcan')}
    />
  );
};

export default TrashCanPageToolBarIcons;
