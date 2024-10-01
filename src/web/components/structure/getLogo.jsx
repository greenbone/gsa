/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/proptypes';

import {applianceComponent} from 'web/utils/applianceData';

const getLogo = model => {
  const Component = applianceComponent[model];
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
    'gsm-ceno_label.svg',
    'gsm-deca_label.svg',
    'gsm-exa_label.svg',
    'gsm-peta_label.svg',
    'gsm-tera_label.svg',
  ]),
};

export default getLogo;
