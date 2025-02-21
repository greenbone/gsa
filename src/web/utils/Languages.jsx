/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import GmpLanguages, {BROWSER_LANGUAGE} from 'gmp/locale/languages';

export {BROWSER_LANGUAGE};

const Languages = {
  ...GmpLanguages,
  [BROWSER_LANGUAGE]: {
    name: _l('Browser Language'),
  },
};

export default Languages;
