/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import PropTypes from 'web/utils/proptypes';

export const ArcDataPropType = PropTypes.shape({
  color: PropTypes.toString.isRequired,
  value: PropTypes.numberOrNumberString.isRequired,
  label: PropTypes.any,
  toolTip: PropTypes.elementOrString,
});

export const DataPropType = PropTypes.arrayOf(ArcDataPropType);
