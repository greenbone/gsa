/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import {showSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {useDispatch} from 'react-redux';
import {transformSettingName} from 'gmp/commands/users';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {renewSessionTimeout} from 'web/store/usersettings/actions';

import {
  loadUserSettingDefault,
  loadUserSettingDefaults,
  loadingActions,
} from 'web/store/usersettings/defaults/actions';

/**
 * Custom hook for managing user settings
 * Provides functions for saving settings and managing error messages
 */
const useSettingSave = () => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [_] = useTranslation();

  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {},
  );

  const loadSettings = useCallback(() => {
    // @ts-expect-error
    dispatch(loadUserSettingDefaults(gmp)());
  }, [dispatch, gmp]);

  const loadSingleSetting = useCallback(
    (settingId: string, silent = false) => {
      // @ts-expect-error
      dispatch(loadUserSettingDefault(gmp)(settingId, silent));
    },
    [dispatch, gmp],
  );

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
          const transformedName = transformSettingName(settingName);
          dispatch(
            loadingActions.optimisticUpdate(
              settingId,
              transformedName,
              String(value),
            ),
          );
        }

        setEditMode(false);

        if (settingId) {
          await gmp.user.saveSetting(settingId, String(value));
        }

        onInteraction();

        setErrorMessages(prev => ({
          ...prev,
          [settingName]: '',
        }));
        showSuccessNotification(
          _('Setting saved successfully'),
          _('Your changes have been saved.'),
        );
      } catch (error) {
        const message =
          // @ts-expect-error
          error.message ?? _('An error occurred');
        setErrorMessages(prev => ({
          ...prev,
          [settingName]: message,
        }));

        if (settingId) {
          loadSingleSetting(settingId, true);
        }

        setEditMode(true);

        console.error(error);
      }
    },
    [_, dispatch, gmp.user, loadSingleSetting, onInteraction],
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

  return {
    errorMessages,
    getErrorMessage,
    saveSetting,
    loadSettings,
    loadSingleSetting,
    onInteraction,
    clearErrorMessage,
    clearAllErrorMessages,
    setErrorMessage,
  };
};

export default useSettingSave;
