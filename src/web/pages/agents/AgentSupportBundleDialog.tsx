/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {parseBoolean} from 'gmp/parser';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface AgentSupportBundleDialogProps {
  loading?: boolean;
  onClose: () => void;
  onDownload: (encryption: boolean, anonymized: boolean) => void;
}

const AgentSupportBundleDialog = ({
  loading,
  onClose,
  onDownload,
}: AgentSupportBundleDialogProps) => {
  const [_] = useTranslation();
  const [encryption, setEncryption] = useState(true);
  const [anonymized, setAnonymized] = useState(false);

  return (
    <ConfirmationDialog
      content={
        <Row align="flex-start" gap="lg" wrap="wrap">
          <FormGroup
            aria-label={_('Encryption')}
            role="radiogroup"
            title={_('Encryption')}
          >
            <Radio<boolean>
              checked={encryption}
              convert={parseBoolean}
              name="support-bundle-encryption"
              title={_('Encrypted support bundle')}
              value={true}
              onChange={setEncryption}
            />
            <Radio<boolean>
              checked={!encryption}
              convert={parseBoolean}
              name="support-bundle-encryption"
              title={_('Plain support bundle')}
              value={false}
              onChange={setEncryption}
            />
          </FormGroup>
          <FormGroup
            aria-label={_('Anonymized operation')}
            role="radiogroup"
            title={_('Anonymized operation')}
          >
            <Radio<boolean>
              checked={anonymized}
              convert={parseBoolean}
              name="support-bundle-anonymized"
              title={_('Anonymized support bundle')}
              value={true}
              onChange={setAnonymized}
            />
            <Radio<boolean>
              checked={!anonymized}
              convert={parseBoolean}
              name="support-bundle-anonymized"
              title={_('Non-anonymized support bundle')}
              value={false}
              onChange={setAnonymized}
            />
          </FormGroup>
        </Row>
      }
      loading={loading}
      rightButtonTitle={_('Download')}
      title={_('Download Agent Support Bundle')}
      onClose={onClose}
      onResumeClick={() => onDownload(encryption, anonymized)}
    />
  );
};

export default AgentSupportBundleDialog;
