/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DataTableDisplay from 'web/components/dashboard/display/DataDisplay';
import transformSeverityClassData, {
  severityClassDataRow,
} from 'web/components/dashboard/display/severity/SeverityClassTransform';

const SeverityClassTableDisplay = props => (
  <DataTableDisplay
    {...props}
    dataRow={severityClassDataRow}
    dataTransform={transformSeverityClassData}
  />
);

export default SeverityClassTableDisplay;
