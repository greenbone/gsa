/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useEffect, useState} from 'react';

import useGmp from 'web/hooks/useGmp';

export const LicenseContext = React.createContext({});

const LicenseProvider = ({children}) => {
  const gmp = useGmp();

  const [license, setLicense] = useState({});
  const [licenseError, setLicenseError] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    updateLicense();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateLicense = () => {
    setIsLoading(true);
    gmp.license
      .getLicenseInformation()
      .then(response => {
        setLicense(response.data);
        setIsLoading(false);
      })
      .catch(err => {
        setIsLoading(false);
        setLicenseError(err);
      });
  };

  return (
    <LicenseContext.Provider
      value={{isLoading, license, licenseError, updateLicense}}
    >
      {children}
    </LicenseContext.Provider>
  );
};

export default LicenseProvider;

// vim: set ts=2 sw=2 tw=80:
