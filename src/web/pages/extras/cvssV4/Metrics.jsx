/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useTranslation from 'src/web/hooks/useTranslation';
import Select from 'web/components/form/Select';

const Metrics = ({metrics, selectedOptions, handleOptionChange}) => {
  const [_] = useTranslation();
  return Object.entries(metrics).map(([metricShort, metric]) => {
    const [_] = useTranslation();

    return (
      <section key={`${metric.name}-${metricShort}`}>
        <Select
          items={Object.entries(metric.options).map(([value, name]) => ({
            label: `${_(name)} (${value})`,
            value: value,
          }))}
          label={`${_(metric.name)} (${metricShort})`}
          name={metricShort}
          value={selectedOptions[metricShort]}
          onChange={handleOptionChange}
        />
      </section>
    );
  });
};

export default Metrics;
