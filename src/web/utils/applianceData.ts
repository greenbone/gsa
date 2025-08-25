/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  GreenboneWhiteLogo,
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

export type ApplianceLogo = keyof typeof APPLIANCE_DATA;

const APPLIANCE_DATA = {
  defaultVendorLabel: {
    title: 'OPENVAS',
    component: GreenboneWhiteLogo,
  },
  'gsm-150_label.svg': {
    title: 'OPENVAS SCAN - 150',
    component: Enterprise150,
  },
  'gsm-400_label.svg': {
    title: 'OPENVAS SCAN - 400',
    component: Enterprise400,
  },
  'gsm-400r2_label.svg': {
    title: 'OPENVAS SCAN - 400',
    component: Enterprise400,
  },
  'gsm-450_label.svg': {
    title: 'OPENVAS SCAN - 450',
    component: Enterprise450,
  },
  'gsm-450r2_label.svg': {
    title: 'OPENVAS SCAN - 450',
    component: Enterprise450,
  },
  'gsm-600_label.svg': {
    title: 'OPENVAS SCAN - 600',
    component: Enterprise600,
  },
  'gsm-600r2_label.svg': {
    title: 'OPENVAS SCAN - 600',
    component: Enterprise600,
  },
  'gsm-650_label.svg': {
    title: 'OPENVAS SCAN - 650',
    component: Enterprise650,
  },
  'gsm-650r2_label.svg': {
    title: 'OPENVAS SCAN - 650',
    component: Enterprise650,
  },
  'gsm-5400_label.svg': {
    title: 'OPENVAS SCAN - 5400',
    component: Enterprise5400,
  },
  'gsm-6500_label.svg': {
    title: 'OPENVAS SCAN - 6500',
    component: Enterprise6500,
  },
  'gsm-ceno_label.svg': {
    title: 'OPENVAS SCAN - CENO',
    component: EnterpriseCeno,
  },
  'gsm-deca_label.svg': {
    title: 'OPENVAS SCAN - DECA',
    component: EnterpriseDeca,
  },
  'gsm-exa_label.svg': {
    title: 'OPENVAS SCAN - EXA',
    component: EnterpriseExa,
  },
  'gsm-peta_label.svg': {
    title: 'OPENVAS SCAN - PETA',
    component: EnterprisePeta,
  },
  'gsm-tera_label.svg': {
    title: 'OPENVAS SCAN - TERA',
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
