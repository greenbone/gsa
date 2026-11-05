/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo, useState} from 'react';
import {useSearchParams} from 'react-router';
import {
  CREDENTIALS_FILTER_FILTER,
  DEFAULT_ROWS_PER_PAGE,
  type FilterType,
} from 'gmp/models/filter';
import QueryFilter from 'gmp/models/filter/query-filter';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Message from 'web/components/error/Message';
import Button from 'web/components/form/Button';
import {ActiveDirectoryIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import Row from 'web/components/layout/Row';
import Link from 'web/components/link/Link';
import Loading from 'web/components/loading/Loading';
import InlineNotification from 'web/components/notification/InlineNotification';
import EntitiesPage from 'web/entities/EntitiesPage';
import {useGetActiveDirectoryCredentials} from 'web/hooks/use-query/active-directory';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import ActiveDirectoryTable from 'web/pages/active-directory/ActiveDirectoryTable';
import CredentialFilterDialog from 'web/pages/credentials/CredentialFilterDialog';
import {ROUTES} from 'web/route-paths';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import SortDirection from 'web/utils/sort-direction';

const ActiveDirectoryConnections = () => {
  const [_] = useTranslation();
  const [params, setParams] = useSearchParams();
  const [toolbarError, setToolbarError] = useState<string>();
  const preferredRows = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).getValueByName('rowsperpage'),
  );
  const rows =
    Number(preferredRows) > 0 ? Number(preferredRows) : DEFAULT_ROWS_PER_PAGE;
  const filterString = params.get('filter') ?? '';
  const filter = useMemo(() => {
    let next = QueryFilter.fromString(filterString);
    if (!next.has('rows')) next = next.set('rows', rows);
    if (!next.has('first')) next = next.first(1);
    if (!next.has('sort') && !next.has('sort-reverse'))
      next = next.set('sort', 'name');
    return next;
  }, [filterString, rows]);
  const {data, isFetching, isError, refetch} =
    useGetActiveDirectoryCredentials(filter);
  const entities = data?.entities ?? [];
  const counts = data?.entitiesCounts;
  const update = (next: FilterType) => {
    setToolbarError(undefined);
    if (next.toFilterString() === filter.toFilterString()) {
      void refetch();
      return;
    }
    const query = new URLSearchParams(params);
    query.set('filter', next.toFilterString());
    setParams(query);
  };
  const reset = () => {
    setToolbarError(undefined);
    const query = new URLSearchParams(params);
    query.delete('filter');
    setParams(query);
  };
  const hasCriteria = filter.toFilterCriteriaString().length > 0;
  let connectionContent = <Loading />;
  if (!isFetching) {
    if (isError) {
      connectionContent = (
        <ErrorMessage
          flex="column"
          message={_('Could not load Active Directory credentials.')}
          role="alert"
        >
          <Button
            title={_('Retry Active Directory credentials')}
            onClick={() => void refetch()}
          />
        </ErrorMessage>
      );
    } else if (entities.length === 0) {
      const emptyMessage = hasCriteria
        ? _('No Active Directory credentials match this filter.')
        : _('No Active Directory credentials available.');
      connectionContent = (
        <Message flex="column" message={emptyMessage}>
          <Row gap="sm" mt="sm" wrap="wrap">
            {hasCriteria && (
              <Button title={_('Clear filter')} onClick={reset} />
            )}
            <Link to={ROUTES.credentials.url}>{_('Manage credentials')}</Link>
          </Row>
        </Message>
      );
    } else {
      connectionContent = (
        <ActiveDirectoryTable
          aria-label={_('Active Directory connections')}
          entities={entities}
          entitiesCounts={counts}
          filter={filter}
          sortBy={filter.getSortBy()}
          sortDir={
            filter.getSortOrder() === 'sort-reverse'
              ? SortDirection.DESC
              : SortDirection.ASC
          }
          onFirstClick={() => update(filter.first(1))}
          onLastClick={() =>
            update(
              filter.first(
                counts && counts.rows > 0
                  ? Math.max(
                      1,
                      Math.floor((counts.filtered - 1) / counts.rows) *
                        counts.rows +
                        1,
                    )
                  : 1,
              ),
            )
          }
          onNextClick={() => update(filter.next())}
          onPreviousClick={() => update(filter.previous())}
          onSortChange={() =>
            update(
              filter
                .delete('sort')
                .delete('sort-reverse')
                .set(
                  filter.getSortOrder() === 'sort-reverse'
                    ? 'sort'
                    : 'sort-reverse',
                  'name',
                )
                .first(1),
            )
          }
        />
      );
    }
  }
  return (
    <>
      <PageTitle title={_('Active Directory')} />
      <EntitiesPage
        createFilterType="credential"
        entities={entities}
        filter={filter}
        filterEditDialog={CredentialFilterDialog}
        filtersFilter={CREDENTIALS_FILTER_FILTER}
        isLoading={isFetching}
        sectionIcon={<ActiveDirectoryIcon size="large" />}
        table={
          <>
            {toolbarError && (
              <InlineNotification message={toolbarError} severity="error" />
            )}
            {connectionContent}
          </>
        }
        title={_('Active Directory')}
        toolBarIcons={
          <ManualIcon
            anchor="managing-credentials"
            page="scanning"
            title={_('Help: Active Directory')}
          />
        }
        onError={error => setToolbarError(error.message)}
        onFilterChanged={next => update(next.first(1))}
        onFilterCreated={next => update(next.first(1))}
        onFilterRemoved={reset}
        onFilterReset={reset}
      />
    </>
  );
};

const ActiveDirectoryPage = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();

  if (
    !features.featureEnabled('ENABLE_AD_INTEGRATION') ||
    !capabilities.mayAccess('target')
  ) {
    return (
      <ErrorMessage
        message={_('Active Directory is not available.')}
        role="alert"
      />
    );
  }

  return <ActiveDirectoryConnections />;
};

export default ActiveDirectoryPage;
