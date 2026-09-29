/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DataTableDisplay, {
  type DataTableDisplayProps,
} from 'web/components/dashboard/display/DataTableDisplay';
import {
  type TransformedSeverityClassData,
  type TransformedSeverityClassDataItem,
} from 'web/components/dashboard/display/severity/severity-class-transform';

type SeverityClassTableDisplayProps = Omit<
  DataTableDisplayProps<TransformedSeverityClassData>,
  'dataRow' | 'children'
>;

const severityClassDataRow = (data?: TransformedSeverityClassData) =>
  data?.map(({label, value}: TransformedSeverityClassDataItem) => [
    label,
    String(value),
  ]) ?? [];

const SeverityClassTableDisplay = (props: SeverityClassTableDisplayProps) => {
  return (
    <DataTableDisplay<TransformedSeverityClassData>
      {...props}
      dataRow={severityClassDataRow}
    />
  );
};

export default SeverityClassTableDisplay;
