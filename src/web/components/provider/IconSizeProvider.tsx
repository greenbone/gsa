/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

export const IconSizeContext = React.createContext<string | undefined>(
  undefined,
);

interface IconSizeProviderProps {
  size: string;
  children: React.ReactNode;
}

const IconSizeProvider: React.FC<IconSizeProviderProps> = ({
  size,
  ...props
}) => <IconSizeContext.Provider {...props} value={size} />;

export default IconSizeProvider;
