/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import transformCvssData, {
  cvssDataRow,
  type TransformedCvssData,
  type CvssData,
  type TransformCvssDataProps,
} from 'web/components/dashboard/display/cvss/cvss-transform';
import DataTableDisplay, {
  type DataTableDisplayProps,
} from 'web/components/dashboard/display/DataTableDisplay';
import useGmp from 'web/hooks/useGmp';

type CvssTableDisplayProps = Omit<
  DataTableDisplayProps<CvssData, TransformedCvssData, TransformCvssDataProps>,
  'dataRow' | 'dataTransform'
>;

const CvssTableDisplay = (props: CvssTableDisplayProps) => {
  const gmp = useGmp();
  const severityRating = gmp.settings.severityRating;
  return (
    <DataTableDisplay<CvssData, TransformedCvssData, TransformCvssDataProps>
      {...props}
      dataRow={cvssDataRow}
      dataTransform={transformCvssData}
      severityRating={severityRating}
    />
  );
};

export default CvssTableDisplay;
