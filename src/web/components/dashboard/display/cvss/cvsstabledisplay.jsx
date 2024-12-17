/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import DataTableDisplay from '../datatabledisplay';
import transformCvssData, {cvssDataRow} from './cvsstransform';

const CvssTableDisplay = props => (
  <DataTableDisplay
    {...props}
    dataRow={cvssDataRow}
    dataTransform={transformCvssData}
  />
);

export default CvssTableDisplay;
