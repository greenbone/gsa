/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import DataTableDisplay from '../datatabledisplay';
import transformSeverityClassData, {
  severityClassDataRow,
} from './severityclasstransform';

const SeverityClassTableDisplay = props => (
  <DataTableDisplay
    {...props}
    dataRow={severityClassDataRow}
    dataTransform={transformSeverityClassData}
  />
);

export default SeverityClassTableDisplay;
