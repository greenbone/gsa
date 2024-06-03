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

import _ from 'gmp/locale';

import FormGroup from 'web/components/form/formgroup';
import Select from 'web/components/form/select';

const Metrics = ({metrics, selectedOptions, handleOptionChange}) => {
  return Object.entries(metrics).map(([metricShort, metric]) => (
    <section key={`${metric.name}-${metricShort}`}>
      <FormGroup title={`${_(metric.name)} (${metricShort})`}>
        <Select
          items={Object.entries(metric.options).map(([value, name]) => ({
            label: `${_(name)} (${value})`,
            value: value,
          }))}
          name={metricShort}
          value={selectedOptions[metricShort]}
          menuPosition="adjust"
          onChange={handleOptionChange}
        />
      </FormGroup>
    </section>
  ));
};

export default Metrics;
