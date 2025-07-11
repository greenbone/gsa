/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {renewSessionTimeout} from 'web/store/usersettings/actions';
import {loadUserSettingDefaults} from 'web/store/usersettings/defaults/actions';

/**
 * Custom hook for managing user settings
 * Provides functions for saving settings and managing error messages
 */
const useSettingsSave = () => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [_] = useTranslation();

  // Map of field-specific error messages, keyed by setting ID or name
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {},
  );

  const loadSettings = useCallback(() => {
    // @ts-expect-error
    dispatch(loadUserSettingDefaults(gmp)());
  }, [dispatch, gmp]);

  const onInteraction = useCallback(() => {
    // @ts-expect-error
    dispatch(renewSessionTimeout(gmp)());
  }, [dispatch, gmp]);

  /**
   * Save a setting to the user's profile
   *
   * @param settingId - The ID of the setting to save
   * @param settingName - The name of the setting (for error reporting)
   * @param value - The value to save
   * @param setEditMode - Function to set the edit mode state (typically to false after saving)
   * @returns Promise<void>
   */
  const saveSetting = useCallback(
    async (
      settingId: string | undefined,
      settingName: string,
      value: string | number,
      setEditMode: (value: boolean) => void,
    ): Promise<void> => {
      try {
        if (settingId) {
          await gmp.user.saveSetting(settingId, String(value));
        }
        setEditMode(false);
        loadSettings();
        onInteraction();
        // Clear error message for this specific setting
        setErrorMessages(prev => ({
          ...prev,
          [settingName]: '',
        }));
      } catch (error) {
        // Preserve the original error message from the backend
        const message =
          // @ts-expect-error
          error.message ?? _('An error occurred');
        // Set error for this specific setting
        setErrorMessages(prev => ({
          ...prev,
          [settingName]: message,
        }));
        console.error(error);
      }
    },
    [_, gmp.user, loadSettings, onInteraction],
  );

  /**
   * Clear all error messages
   */
  const clearAllErrorMessages = useCallback(() => {
    setErrorMessages({});
  }, []);

  /**
   * Clear error message for a specific setting
   *
   * @param settingName - The name of the setting to clear errors for
   */
  const clearErrorMessage = useCallback((settingName: string) => {
    setErrorMessages(prev => ({
      ...prev,
      [settingName]: '',
    }));
  }, []);

  /**
   * Set a custom error message for a specific setting
   *
   * @param settingName - The name of the setting to set error for
   * @param message - The error message to display
   */
  const setErrorMessage = useCallback(
    (settingName: string, message: string) => {
      setErrorMessages(prev => ({
        ...prev,
        [settingName]: message,
      }));
    },
    [],
  );

  /**
   * Get error message for a specific setting
   *
   * @param settingName - The name of the setting to get error for
   */
  const getErrorMessage = useCallback(
    (settingName: string) => {
      return errorMessages[settingName] || '';
    },
    [errorMessages],
  );

  return {
    errorMessages,
    getErrorMessage,
    saveSetting,
    loadSettings,
    onInteraction,
    clearErrorMessage,
    clearAllErrorMessages,
    setErrorMessage,
  };
};

export default useSettingsSave;
