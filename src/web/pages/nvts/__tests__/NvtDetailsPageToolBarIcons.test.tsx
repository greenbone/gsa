/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Nvt from 'gmp/models/nvt';
import NvtDetailsPageToolBarIcons from 'web/pages/nvts/NvtDetailsPageToolBarIcons';

const manualUrl = 'test/';

const nvt = Nvt.fromElement({
  _id: '12345',
  owner: {
    name: '',
  },
  name: '12345',
  comment: '',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  writable: 0,
  in_use: 0,
  update_time: '2020-10-30T11:44:00.000+0000',
  nvt: {
    _oid: '12345',
    name: 'foo',
    family: 'A Family',
    cvss_base: 4.9,
    qod: {
      value: 80,
      type: 'remote_banner',
    },
    tags: 'cvss_base_vector=AV:N/AC:M/Au:S/C:P/I:N/A:P|summary=This is a CVSS description|solution_type=VendorFix|insight=An Insight|impact=An Impact|vuldetect=A VulDetect|affected=It is affected',
    solution: {
      _type: 'VendorFix',
      __text: 'This is a solution description',
    },
    epss: {
      max_severity: {
        score: 0.8765,
        percentile: 90.0,
        cve: {
          _id: 'CVE-2020-1234',
          severity: 10.0,
        },
      },
      max_epss: {
        score: 0.9876,
        percentile: 80.0,
        cve: {
          _id: 'CVE-2020-5678',
        },
      },
    },
    timeout: '',
    refs: {
      ref: [
        {_type: 'cve', _id: 'CVE-2020-1234'},
        {_type: 'cve', _id: 'CVE-2020-5678'},
      ],
    },
  },
});

describe('NvtDetailsPageToolBarIcons tests', () => {
  test('should render', () => {
    const handleNvtDownloadClick = testing.fn();
    const handleOnNoteCreateClick = testing.fn();
    const handleOnOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl, enableEPSS: true}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <NvtDetailsPageToolBarIcons
        entity={nvt}
        onNoteCreateClick={handleOnNoteCreateClick}
        onNvtDownloadClick={handleNvtDownloadClick}
        onOverrideCreateClick={handleOnOverrideCreateClick}
      />,
    );

    expect(screen.getByTitle('Help: NVTs')).toBeInTheDocument();
    expect(screen.getByTestId('manual-link')).toHaveAttribute(
      'href',
      'test/en/managing-secinfo.html#vulnerability-tests-vt',
    );

    expect(screen.getByTitle('NVT List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/nvts',
    );

    expect(screen.getByTitle('Export NVT')).toBeInTheDocument();
    expect(screen.getByTitle('Add new Note')).toBeInTheDocument();
    expect(screen.getByTitle('Add new Override')).toBeInTheDocument();

    const resultsIcon = screen.getByTitle('Corresponding Results');
    expect(resultsIcon).toBeInTheDocument();
    expect(resultsIcon.closest('a')).toHaveAttribute(
      'href',
      '/results?filter=nvt%3D12345',
    );

    const vulnerabilitiesIcon = screen.getByTitle(
      'Corresponding Vulnerabilities',
    );
    expect(vulnerabilitiesIcon).toBeInTheDocument();
    expect(vulnerabilitiesIcon.closest('a')).toHaveAttribute(
      'href',
      '/vulnerabilities?filter=uuid%3D12345',
    );
  });

  test('should call click handlers', () => {
    const handleNvtDownloadClick = testing.fn();
    const handleOnNoteCreateClick = testing.fn();
    const handleOnOverrideCreateClick = testing.fn();

    const gmp = {settings: {manualUrl, enableEPSS: true}};

    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
    });

    render(
      <NvtDetailsPageToolBarIcons
        entity={nvt}
        onNoteCreateClick={handleOnNoteCreateClick}
        onNvtDownloadClick={handleNvtDownloadClick}
        onOverrideCreateClick={handleOnOverrideCreateClick}
      />,
    );

    const exportIcon = screen.getByTitle('Export NVT');
    const addNewNoteIcon = screen.getByTitle('Add new Note');
    const addNewOverrideIcon = screen.getByTitle('Add new Override');

    fireEvent.click(exportIcon);
    expect(handleNvtDownloadClick).toHaveBeenCalledWith(nvt);

    fireEvent.click(addNewNoteIcon);
    expect(handleOnNoteCreateClick).toHaveBeenCalledWith(nvt);

    fireEvent.click(addNewOverrideIcon);
    expect(handleOnOverrideCreateClick).toHaveBeenCalledWith(nvt);
  });
});
