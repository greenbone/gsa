/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  Enterprise150,
  Enterprise400,
  Enterprise450,
  Enterprise600,
  Enterprise650,
  Enterprise5400,
  Enterprise6500,
  EnterpriseCeno,
  EnterpriseDeca,
  EnterpriseExa,
  EnterprisePeta,
  EnterpriseTera,
} from 'web/components/icon/GreenboneApplianceLogo';

const APPLIANCE_DATA = {
  'gsm-150_label.svg': {
    title: 'Greenbone - 150',
    component: Enterprise150,
  },
  'gsm-400_label.svg': {
    title: 'Greenbone - 400',
    component: Enterprise400,
  },
  'gsm-400r2_label.svg': {
    title: 'Greenbone - 400',
    component: Enterprise400,
  },
  'gsm-450_label.svg': {
    title: 'Greenbone - 450',
    component: Enterprise450,
  },
  'gsm-450r2_label.svg': {
    title: 'Greenbone - 450',
    component: Enterprise450,
  },
  'gsm-600_label.svg': {
    title: 'Greenbone - 600',
    component: Enterprise600,
  },
  'gsm-600r2_label.svg': {
    title: 'Greenbone - 600',
    component: Enterprise600,
  },
  'gsm-650_label.svg': {
    title: 'Greenbone - 650',
    component: Enterprise650,
  },
  'gsm-650r2_label.svg': {
    title: 'Greenbone - 650',
    component: Enterprise650,
  },
  'gsm-5400_label.svg': {
    title: 'Greenbone - 5400',
    component: Enterprise5400,
  },
  'gsm-6500_label.svg': {
    title: 'Greenbone - 6500',
    component: Enterprise6500,
  },
  'gsm-ceno_label.svg': {
    title: 'Greenbone - CENO',
    component: EnterpriseCeno,
  },
  'gsm-deca_label.svg': {
    title: 'Greenbone - DECA',
    component: EnterpriseDeca,
  },
  'gsm-exa_label.svg': {
    title: 'Greenbone - EXA',
    component: EnterpriseExa,
  },
  'gsm-peta_label.svg': {
    title: 'Greenbone - PETA',
    component: EnterprisePeta,
  },
  'gsm-tera_label.svg': {
    title: 'Greenbone - TERA',
    component: EnterpriseTera,
  },
};

export const applianceTitle = Object.fromEntries(
  Object.entries(APPLIANCE_DATA).map(([vendorLabel, {title}]) => [
    vendorLabel,
    title,
  ]),
);

export const applianceComponent = Object.fromEntries(
  Object.entries(APPLIANCE_DATA).map(([vendorLabel, {component}]) => [
    vendorLabel,
    component,
  ]),
);
