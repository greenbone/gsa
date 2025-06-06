/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import I18NextHttpBackend from 'i18next-http-backend';
import {initLocale} from 'gmp/locale/lang';

class FakeBackend {
  static type = 'backend';

  read(language, namespace, callback) {
    if (language.startsWith('en') || language.startsWith('de')) {
      // change language by calling the callback function
      return callback();
    }
    // change language and pass error message
    return callback('Unknown lang');
  }
}

class FakeLanguageDetector {
  static type = 'languageDetector';

  init() {}

  detect() {
    return 'en';
  }

  cacheUserLanguage() {}
}

void initLocale({
  backend: FakeBackend as typeof I18NextHttpBackend,
  detector: FakeLanguageDetector,
});
