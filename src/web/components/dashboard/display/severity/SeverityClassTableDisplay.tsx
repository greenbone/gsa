/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DataTableDisplay, {
  type DataTableDisplayProps,
} from 'web/components/dashboard/display/DataTableDisplay';
import transformSeverityClassData, {
  type TransformedSeverityClassData,
  type SeverityClassData,
  type SeverityData,
  type TransformSeverityDataProps,
} from 'web/components/dashboard/display/severity/severity-class-transform';

type SeverityClassTableDisplayProps = Omit<
  DataTableDisplayProps<
    SeverityData,
    TransformedSeverityClassData,
    TransformSeverityDataProps
  >,
  'dataRow' | 'dataTransform'
>;

const severityClassDataRow = ({label, value}: SeverityClassData) => [
  label,
  String(value),
];

const SeverityClassTableDisplay = (props: SeverityClassTableDisplayProps) => (
  <DataTableDisplay<
    SeverityData,
    TransformedSeverityClassData,
    TransformSeverityDataProps
  >
    {...props}
    dataRow={severityClassDataRow}
    dataTransform={transformSeverityClassData}
  />
);

export default SeverityClassTableDisplay;
