/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Icon from './svg/wizard.svg';
import withSvgIcon from './withSvgIcon';


const WizardIconComponent = withSvgIcon()(Icon);

const WizardIcon = props => (
  <WizardIconComponent {...props} data-testid="wizard-icon" />
);

export default WizardIcon;

// vim: set ts=2 sw=2 tw=80:
