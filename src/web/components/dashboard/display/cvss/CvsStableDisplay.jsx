/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import transformCvssData, {
  cvssDataRow,
} from 'web/components/dashboard/display/cvss/CvssTransform';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useGmp from 'web/hooks/useGmp';

const CvssTableDisplay = props => {
  const gmp = useGmp();
  const severityRating = gmp.settings.severityRating;
  return (
    <DataTableDisplay
      {...props}
      dataRow={cvssDataRow}
      dataTransform={transformCvssData}
      severityRating={severityRating}
    />
  );
};

export default CvssTableDisplay;
