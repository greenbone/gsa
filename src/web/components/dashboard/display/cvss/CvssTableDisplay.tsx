/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  cvssDataRow,
  type TransformedCvssData,
} from 'web/components/dashboard/display/cvss/cvss-transform';
import DataTableDisplay, {
  type DataTableDisplayProps,
} from 'web/components/dashboard/display/DataTableDisplay';

type CvssTableDisplayProps = Omit<
  DataTableDisplayProps<TransformedCvssData>,
  'children' | 'dataRow'
>;

const CvssTableDisplay = (props: CvssTableDisplayProps) => {
  return (
    <DataTableDisplay<TransformedCvssData> {...props} dataRow={cvssDataRow} />
  );
};

export default CvssTableDisplay;
