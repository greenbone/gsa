/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import transformCvssData, {
  cvssDataRow,
} from 'web/components/dashboard/display/cvss/CvssTransform';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';

const CvssTableDisplay = props => (
  <DataTableDisplay
    {...props}
    dataRow={cvssDataRow}
    dataTransform={transformCvssData}
  />
);

export default CvssTableDisplay;
