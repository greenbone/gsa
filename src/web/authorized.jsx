/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate, useLocation} from 'react-router-dom';
import useGmp from 'web/hooks/useGmp';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';
import PropTypes from 'web/utils/proptypes';

import {setIsLoggedIn} from './store/usersettings/actions';

const Authorized = ({children}) => {
  const gmp = useGmp();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useSelector(selectIsLoggedIn);

  const logout = useCallback(() => {
    gmp.logout();
    dispatch(setIsLoggedIn(false));
  }, [dispatch, gmp]);

  const responseError = useCallback(
    xhr => {
      if (xhr.status === 401) {
        logout();
        return Promise.resolve(xhr);
      }
      return Promise.reject(xhr);
    },
    [logout],
  );

  const checkIsLoggedIn = useCallback(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {next: location.pathname},
      });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  useEffect(() => {
    const unsubscribe = gmp.addHttpErrorHandler(responseError);
    checkIsLoggedIn();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [gmp, responseError, checkIsLoggedIn]);

  useEffect(() => {
    checkIsLoggedIn();
  }, [isLoggedIn, checkIsLoggedIn]);

  return isLoggedIn ? children : null;
};

Authorized.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Authorized;
