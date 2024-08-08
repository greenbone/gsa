/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';

import {LicenseContext} from 'web/components/provider/licenseprovider';

const useLicense = () => useContext(LicenseContext);

export default useLicense;
