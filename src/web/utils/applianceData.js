/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const APPLIANCE_DATA = {
  'gsm-150_label.svg': {
    title: 'Greenbone - 150',
  },
  'gsm-400_label.svg': {
    title: 'Greenbone - 400',
  },
  'gsm-400r2_label.svg': {
    title: 'Greenbone - 400',
  },
  'gsm-450_label.svg': {
    title: 'Greenbone - 450',
  },
  'gsm-450r2_label.svg': {
    title: 'Greenbone - 450',
  },
  'gsm-600_label.svg': {
    title: 'Greenbone - 600',
  },
  'gsm-600r2_label.svg': {
    title: 'Greenbone - 600',
  },
  'gsm-650_label.svg': {
    title: 'Greenbone - 650',
  },
  'gsm-650r2_label.svg': {
    title: 'Greenbone - 650',
  },
  'gsm-5400_label.svg': {
    title: 'Greenbone - 5400',
  },
  'gsm-6500_label.svg': {
    title: 'Greenbone - 6500',
  },
  'gsm-ceno_label.svg': {
    title: 'Greenbone - CENO',
  },
  'gsm-deca_label.svg': {
    title: 'Greenbone - DECA',
  },
  'gsm-exa_label.svg': {
    title: 'Greenbone - EXA',
  },
  'gsm-peta_label.svg': {
    title: 'Greenbone - PETA',
  },
  'gsm-tera_label.svg': {
    title: 'Greenbone - TERA',
  },
};

export const applianceTitle = Object.fromEntries(
  Object.entries(APPLIANCE_DATA).map(([vendorLabel, {title}]) => [
    vendorLabel,
    title,
  ]),
);
