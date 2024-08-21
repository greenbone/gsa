/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {CVSS40} from '@pandatix/js-cvss';

export const expectedMetricOptionsOrdered = [
  ['AV', 'N', 'A', 'L', 'P'],
  ['AC', 'L', 'H'],
  ['AT', 'N', 'P'],
  ['PR', 'N', 'L', 'H'],
  ['UI', 'N', 'P', 'A'],
  ['VC', 'N', 'L', 'H'],
  ['VI', 'N', 'L', 'H'],
  ['VA', 'N', 'L', 'H'],
  ['SC', 'N', 'L', 'H'],
  ['SI', 'N', 'L', 'H'],
  ['SA', 'N', 'L', 'H'],
  ['E', 'X', 'A', 'P', 'U'],
  ['CR', 'X', 'H', 'M', 'L'],
  ['IR', 'X', 'H', 'M', 'L'],
  ['AR', 'X', 'H', 'M', 'L'],
  ['MAV', 'X', 'N', 'A', 'L', 'P'],
  ['MAC', 'X', 'L', 'H'],
  ['MAT', 'X', 'N', 'P'],
  ['MPR', 'X', 'N', 'L', 'H'],
  ['MUI', 'X', 'N', 'P', 'A'],
  ['MVC', 'X', 'H', 'L', 'N'],
  ['MVI', 'X', 'H', 'L', 'N'],
  ['MVA', 'X', 'H', 'L', 'N'],
  ['MSC', 'X', 'H', 'L', 'N'],
  ['MSI', 'X', 'S', 'H', 'L', 'N'],
  ['MSA', 'X', 'S', 'H', 'L', 'N'],
  ['S', 'X', 'N', 'P'],
  ['AU', 'X', 'N', 'Y'],
  ['R', 'X', 'A', 'U', 'I'],
  ['V', 'X', 'D', 'C'],
  ['RE', 'X', 'L', 'M', 'H'],
  ['U', 'X', 'Clear', 'Green', 'Amber', 'Red'],
];

const cvss4MetricValueToLabels = {
  AV: {
    N: 'Network',
    A: 'Adjacent',
    L: 'Local',
    P: 'Physical',
  },
  AC: {
    L: 'Low',
    H: 'High',
  },
  AT: {
    N: 'None',
    P: 'Present',
  },
  PR: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  UI: {
    N: 'None',
    P: 'Passive',
    A: 'Active',
  },
  VC: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  VI: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  VA: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  SC: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  SI: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
  SA: {
    N: 'None',
    L: 'Low',
    H: 'High',
  },
};

/**
 * This function calculates the CVSS vector from a set of metrics.
 *
 * @param {Record<string,string>} cvssVectorObject - An object with key-value pairs of the metrics.
 * @returns {string} - The CVSS vector string.
 */

export const calculateVector = cvssVectorObject => {
  const result = expectedMetricOptionsOrdered
    .filter(metric => cvssVectorObject[metric[0]] !== undefined)
    .map(metric => `${metric[0]}:${cvssVectorObject[metric[0]]}`)
    .join('/');
  return result;
};

/**
 * This function processes a CVSS vector string and returns an object with the metrics.
 * Checks if the metric is a valid option.
 *
 * @param {string} vectorString - The CVSS vector string to process.
 * @returns {Record<string,string>} - An object with key-value pairs of the metrics.
 */

export const processVector = vectorString => {
  const vector = vectorString.replace(/^CVSS:4.0\//, '').split('/');
  const result = {};
  const expectedMetricMap = new Map(
    expectedMetricOptionsOrdered.map(metric => [metric[0], metric]),
  );

  vector.forEach(metricString => {
    const [key, value] = metricString.split(':');
    if (
      expectedMetricMap.has(key) &&
      value &&
      expectedMetricMap.get(key).includes(value)
    ) {
      result[key] = value;
    }
  });

  return result;
};

/**
 * This function removes the unused metrics from a CVSS vector.
 * The unused optional metrics are the ones with the value 'X'.
 *
 * @param {Record<string,string>} cvssVector - The CVSS vector to remove the unused metrics.
 * @returns {string} - The CVSS vector without the unused metrics.
 */

export const removeUnusedMetrics = cvssVector => {
  const vector = calculateVector(cvssVector).split('/');

  const validMetrics = vector.filter(metric => {
    const [, value] = metric.split(':');
    return value !== 'X';
  });

  const orderMap = new Map(
    expectedMetricOptionsOrdered.map((metric, index) => [metric[0], index]),
  );

  const getKey = metricString => metricString.split(':')[0];
  validMetrics.sort(
    (a, b) => orderMap.get(getKey(a)) - orderMap.get(getKey(b)),
  );

  return validMetrics.join('/');
};

/**
 * This function calculates the CVSS score from a CVSS vector.
 * @param {string} cvssVector - The CVSS vector with all the metrics to calculate the score.
 * @returns {number | undefined} - The CVSS score.
 *
 */

export const calculateScoreSafely = cvssVector => {
  try {
    return new CVSS40(cvssVector).Score();
  } catch {
    return undefined;
  }
};

/**
 * This function parses a CVSS vector string and returns an object with the
 * metrics as labels.
 * @param {string} cvssVector - The CVSS vector to parse the metrics from.
 * @returns {Record<string,string>} - An object with key-value pairs of the metrics.
 */
export const parseCvssV4MetricsFromVector = cvssVector => {
  if (!isDefined(cvssVector) || cvssVector.trim().length === 0) {
    return {};
  }
  let ret = {};
  const metrics = processVector(cvssVector);

  for (const metric in metrics) {
    const value = metrics[metric];
    if (
      isDefined(cvss4MetricValueToLabels[metric]) &&
      isDefined(cvss4MetricValueToLabels[metric][value])
    )
      ret[metric] = cvss4MetricValueToLabels[metric][value];
  }
  return ret;
};
