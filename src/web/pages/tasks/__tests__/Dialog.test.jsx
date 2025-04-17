/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import ScanConfig from 'gmp/models/scanconfig';
import {
    CVE_SCANNER_TYPE,
    OPENVAS_DEFAULT_SCANNER_ID,
    OPENVAS_SCANNER_TYPE,
    OPENVASD_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {
    getDialogCloseButton,
    getDialogSaveButton,
    getSelectItemElementsForSelect,
    queryAllSelectElements,
} from 'web/components/testing';
import TaskDialog from 'web/pages/tasks/Dialog';
import {fireEvent, rendererWith, wait} from 'web/utils/Testing';

describe('TaskDialog component tests', () => {
  const gmp = {settings: {}};
  const scanConfig = ScanConfig.fromElement({
    id: 'config-1',
    name: 'Test Config',
  });

  const commonHandlers = () => ({
    onClose: testing.fn(),
    onSave: testing.fn(),
    onAlertsChange: testing.fn(),
    onNewAlertClick: testing.fn(),
    onNewScheduleClick: testing.fn(),
    onNewTargetClick: testing.fn(),
    onScanConfigChange: testing.fn(),
    onScannerChange: testing.fn(),
    onScheduleChange: testing.fn(),
    onTargetChange: testing.fn(),
    onEsxiCredentialChange: testing.fn(),
    onKrb5CredentialChange: testing.fn(),
    onNewCredentialsClick: testing.fn(),
    onNewPortListClick: testing.fn(),
    onPortListChange: testing.fn(),
    onSmbCredentialChange: testing.fn(),
    onSnmpCredentialChange: testing.fn(),
    onSshCredentialChange: testing.fn(),
    onSshElevateCredentialChange: testing.fn(),
  });

  const renderDialog = scannerType =>
    rendererWith({gmp, capabilities: true}).render(
      <TaskDialog
          alerts={[]}
          comment="hello world"
          config_id="config-1"
          name="target"
          scan_configs={[scanConfig]}
          scanner_id="scanner-id"
          scanners={[{id: 'scanner-id', scannerType, name: 'Test Scanner'}]}
          schedules={[]}
          tags={[]}
          targets={[]}
        {...commonHandlers()}
      />,
    );

  test('should render scan config section for OPENVAS_SCANNER_TYPE', async () => {
    renderDialog(OPENVAS_SCANNER_TYPE);
    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(5);

    const scanConfigSelect = selects[3];
    fireEvent.click(scanConfigSelect);

    const options = await getSelectItemElementsForSelect(scanConfigSelect);
    expect(options[0]).toHaveTextContent('Test Config');
  });

  test('should render scan config section for OPENVASD_SCANNER_TYPE', async () => {
    renderDialog(OPENVASD_SCANNER_TYPE);
    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(5);

    const scanConfigSelect = selects[3];
    fireEvent.click(scanConfigSelect);

    const options = await getSelectItemElementsForSelect(scanConfigSelect);
    expect(options[0]).toHaveTextContent('Test Config');
  });

  test('should not render scan config section for CVE_SCANNER_TYPE', () => {
    renderDialog(CVE_SCANNER_TYPE);
    const selects = queryAllSelectElements();
    expect(selects.length).toEqual(3); // config select is hidden
  });

  test('should save dialog with updated values', async () => {
    const onSave = testing.fn();
    const {getByName} = rendererWith({gmp, capabilities: true}).render(
      <TaskDialog
        {...commonHandlers()}
        alerts={[]}
        comment="initial comment"
        name="InitialTask"
        scan_configs={[scanConfig]}
        scanner_id={OPENVAS_DEFAULT_SCANNER_ID}
        scanners={[
          {id: OPENVAS_DEFAULT_SCANNER_ID, scanner_type: OPENVAS_SCANNER_TYPE},
        ]}
        schedules={[]}
        tags={[]}
        targets={[]}
        onSave={onSave}
      />,
    );

    fireEvent.change(getByName('name'), {target: {value: 'UpdatedTask'}});
    fireEvent.change(getByName('comment'), {
      target: {value: 'Updated comment'},
    });

    fireEvent.click(getDialogSaveButton());

    await wait(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  test('should close dialog on close button click', () => {
    const onClose = testing.fn();
    rendererWith({gmp, capabilities: true}).render(
      <TaskDialog {...defaultProps} onClose={onClose} />,
    );

    fireEvent.click(getDialogCloseButton());
    expect(onClose).toHaveBeenCalled();
  });

  const defaultProps = {
    scan_configs: [scanConfig],
    scanners: [
      {id: OPENVAS_DEFAULT_SCANNER_ID, scanner_type: OPENVAS_SCANNER_TYPE},
    ],
    scanner_id: OPENVAS_DEFAULT_SCANNER_ID,
    targets: [],
    alerts: [],
    schedules: [],
    tags: [],
    ...commonHandlers(),
  };
});
