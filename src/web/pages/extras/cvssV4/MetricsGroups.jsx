/* Copyright (C) 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import PropTypes from 'prop-types';

import Metrics from 'web/pages/extras/cvssV4/Metrics';

const MetricsGroups = ({
  cvssConfigData,
  selectedOptions,
  handleOptionChange,
}) => {
  let lastMetricType = null;
  return Object.entries(cvssConfigData).flatMap(
    ([metricType, metricGroups]) => {
      const metricGroupElements = Object.entries(metricGroups).map(
        ([metricGroupName, metrics]) => {
          const isDifferentMetricType = lastMetricType !== metricType;
          lastMetricType = metricType;
          return (
            <section key={`${metricGroupName}-${metricType}`}>
              {isDifferentMetricType && <h3>{metricType}</h3>}
              {metricType !== metricGroupName && <h4>{metricGroupName}</h4>}
              <Metrics
                metrics={metrics}
                selectedOptions={selectedOptions}
                handleOptionChange={handleOptionChange}
              />
            </section>
          );
        },
      );
      return metricGroupElements;
    },
  );
};

MetricsGroups.propTypes = {
  cvssConfigData: PropTypes.object.isRequired,
  selectedOptions: PropTypes.object.isRequired,
  handleOptionChange: PropTypes.func.isRequired,
};

export default MetricsGroups;
