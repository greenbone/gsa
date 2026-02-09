/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Button from 'web/components/form/Button';
import {VerifyIcon, VerifyNoIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import useTranslation from 'web/hooks/useTranslation';
import {useFeedKey} from 'web/pages/feed-configuration/FeedKeyComponent';
import Theme from 'web/utils/Theme';

const FeedKeyCard = styled(Layout)`
  background: ${Theme.white};
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 8px;
  padding: 24px;
  gap: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const IconContainer = styled.div<{hasKey: boolean}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({hasKey}) => (hasKey ? Theme.lightGreen : Theme.lightGray)};
  color: ${({hasKey}) => (hasKey ? Theme.green : Theme.mediumGray)};
  flex-shrink: 0;
`;

const Title = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${Theme.mediumGray};
`;

const FeedKeyTab = () => {
  const [_] = useTranslation();
  const {isLoading, hasKey, deleteKey, isDeleting, uploadKey} = useFeedKey();

  if (isLoading) {
    return <Loading />;
  }

  const feedKeyData = hasKey
    ? {
        icon: <VerifyIcon size="large" />,
        title: _('Feed Key Active'),
        description: _(
          'Your feed key is properly configured and active. Enterprise Feed features are available.',
        ),
        action: (
          <Button
            disabled={isDeleting}
            title={_('Delete Feed Key')}
            variant="danger"
            onClick={deleteKey}
          >
            {isDeleting ? _('Deleting...') : _('Delete Key')}
          </Button>
        ),
      }
    : {
        icon: <VerifyNoIcon size="large" />,
        title: _('No Feed Key Configured'),
        description: _(
          'Upload a feed key to enable Enterprise Feed features and content updates.',
        ),
        action: (
          <Button
            color="green"
            title={_('Upload Feed Key')}
            variant="filled"
            onClick={uploadKey}
          >
            {_('Upload Key')}
          </Button>
        ),
      };

  return (
    <FeedKeyCard align={['start', 'center']}>
      <IconContainer hasKey={hasKey}>{feedKeyData.icon}</IconContainer>

      <Layout grow flex="column">
        <Title>{feedKeyData.title}</Title>
        <Description>{feedKeyData.description}</Description>
      </Layout>

      {feedKeyData.action}
    </FeedKeyCard>
  );
};

export default FeedKeyTab;
