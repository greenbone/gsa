/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
