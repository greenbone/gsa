/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Model, {type ModelElement, type ModelProperties} from 'gmp/models/model';
import {parseBoolean, parseToString, type YesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';

interface PreferenceElement {
  _secret?: YesNo;
  name?: string;
  type?: string;
  pattern?: string;
  passphrase_name?: string;
  value?: string;
  default_value?: string;
}

interface PreferencesElement {
  preference?: PreferenceElement | PreferenceElement[];
}

interface SelectorElement {
  name?: string;
  pattern?: string;
  default_value?: string;
  credential_types?: {
    credential_type?: string | string[];
  };
}

interface SelectorsElement {
  selector?: SelectorElement | SelectorElement[];
}

export interface CredentialStoreElement extends ModelElement {
  version?: string;
  active?: YesNo;
  host?: string;
  path?: string;
  preferences?: PreferencesElement;
  selectors?: SelectorsElement;
}

interface Preference {
  secret: boolean;
  name: string;
  type: string;
  pattern?: string;
  passphraseeName?: string;
  value?: string;
  defaultValue?: string;
}

interface Selector {
  name: string;
  pattern?: string;
  defaultValue?: string;
  credentialTypes: string[];
}

interface CredentialStoreProperties extends ModelProperties {
  version?: string;
  active?: YesNo;
  host?: string;
  path?: string;
  preferences?: Preference[];
  selectors?: Selector[];
}

class CredentialStore extends Model {
  static readonly entityType = 'credential';

  readonly version?: string;
  readonly active?: YesNo;
  readonly host?: string;
  readonly path?: string;
  readonly preferences?: Preference[];
  readonly selectors?: Selector[];

  constructor({
    version,
    active,
    host,
    path,
    preferences,
    selectors,
    ...properties
  }: CredentialStoreProperties = {}) {
    super(properties);

    this.version = version;
    this.active = active;
    this.host = host;
    this.path = path;
    this.preferences = preferences;
    this.selectors = selectors;
  }

  static fromElement(element: CredentialStoreElement = {}): CredentialStore {
    const props = this.parseElement(element);
    return new CredentialStore(props);
  }

  static parseElement(
    element: CredentialStoreElement = {},
  ): CredentialStoreProperties {
    const copy = super.parseElement(element) as CredentialStoreProperties;

    const {preferences, selectors} = element;

    // Parse basic fields
    copy.version = parseToString(element.version);
    copy.active = element.active;
    copy.host = parseToString(element.host);
    copy.path = parseToString(element.path);

    // Parse preferences
    if (isDefined(preferences?.preference)) {
      const preferencesList = Array.isArray(preferences.preference)
        ? preferences.preference
        : [preferences.preference];
      copy.preferences = preferencesList.map(pref => ({
        secret: parseBoolean(pref._secret),
        name: parseToString(pref.name) || '',
        type: parseToString(pref.type) || '',
        pattern: parseToString(pref.pattern),
        passphraseeName: parseToString(pref.passphrase_name),
        value: parseToString(pref.value),
        defaultValue: parseToString(pref.default_value),
      }));
    }

    // Parse selectors
    if (isDefined(selectors?.selector)) {
      const selectorsList = Array.isArray(selectors.selector)
        ? selectors.selector
        : [selectors.selector];
      copy.selectors = selectorsList.map(sel => ({
        name: parseToString(sel.name) || '',
        pattern: parseToString(sel.pattern),
        defaultValue: parseToString(sel.default_value),
        credentialTypes: sel.credential_types
          ? Array.isArray(sel.credential_types.credential_type)
            ? sel.credential_types.credential_type
            : sel.credential_types.credential_type
              ? [sel.credential_types.credential_type]
              : []
          : [],
      }));
    }

    return copy;
  }

  getPreference(name: string): Preference | undefined {
    return this.preferences?.find(pref => pref.name === name);
  }

  getSelector(name: string): Selector | undefined {
    return this.selectors?.find(sel => sel.name === name);
  }
}

export default CredentialStore;
