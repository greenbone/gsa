/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import FeaturesContext from 'web/components/provider/FeaturesProvider';

const useFeatures = () => {
  const features = useContext(FeaturesContext);
  if (!features) {
    throw new Error('useFeatures must be used within a FeaturesProvider');
  }
  return features;
};

export default useFeatures;
