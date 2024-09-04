/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/proptypes';
import {
  Enterprise150,
  Enterprise400,
  Enterprise450,
  Enterprise600,
  Enterprise650,
  Enterprise5400,
  Enterprise6500,
} from 'web/components/icon/GreenboneApplianceLogo';

const APPLIANCE_MODELS = {
  'gsm-150_label.svg': Enterprise150,
  'gsm-400_label.svg': Enterprise400,
  'gsm-400r2_label.svg': Enterprise400,
  'gsm-450_label.svg': Enterprise450,
  'gsm-450r2_label.svg': Enterprise450,
  'gsm-600_label.svg': Enterprise600,
  'gsm-600r2_label.svg': Enterprise600,
  'gsm-650_label.svg': Enterprise650,
  'gsm-650r2_label.svg': Enterprise650,
  'gsm-5400_label.svg': Enterprise5400,
  'gsm-6500_label.svg': Enterprise6500,
};

const getLogo = model => {
  const Component = APPLIANCE_MODELS[model];
  return Component ? <Component /> : undefined;
};

getLogo.propTypes = {
  model: PropTypes.oneOf([
    'gsm-150_label.svg',
    'gsm-400_label.svg',
    'gsm-400r2_label.svg',
    'gsm-450_label.svg',
    'gsm-450r2_label.svg',
    'gsm-600_label.svg',
    'gsm-600r2_label.svg',
    'gsm-650_label.svg',
    'gsm-650r2_label.svg',
    'gsm-5400_label.svg',
    'gsm-6500_label.svg',
  ]),
};

export default getLogo;
