/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Updates the `displayName` property of a wrapper React component to include
 * the name of the wrapped component for easier debugging and identification.
 *
 * @param wrapper - The wrapper React component whose `displayName` will be updated.
 * @param component - The wrapped React component whose name or `displayName` will be included.
 * @param name - A string representing the base name to use for the wrapper component.
 * @returns The wrapper component with an updated `displayName` property.
 */
export const updateDisplayName = <T, U>(
  wrapper: React.ComponentType<T>,
  component: React.ComponentType<U> | string,
  name: string,
) => {
  const displayName =
    typeof component === 'string'
      ? component
      : component.displayName || component.name || 'Component';
  wrapper.displayName = `${name}(${displayName})`;
  return wrapper;
};
