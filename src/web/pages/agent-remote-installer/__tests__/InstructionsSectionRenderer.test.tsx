/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen, within} from 'web/testing';
import InstructionsSectionRenderer from 'web/pages/agent-remote-installer/InstructionsSectionRenderer';
import {
  SectionId,
  SectionType,
  type InstructionsSection,
} from 'web/pages/agent-remote-installer/types';

describe('InstructionsSectionRenderer tests', () => {
  describe('HEADING', () => {
    test('should render level-2 heading', () => {
      const section: InstructionsSection = {
        id: 'h2',
        type: SectionType.HEADING,
        level: 2,
        text: 'Quick Install',
      };
      const {container} = render(
        <InstructionsSectionRenderer section={section} />,
      );
      expect(container.querySelector('h2')).toHaveTextContent('Quick Install');
    });

    test('should render level-3 heading', () => {
      const section: InstructionsSection = {
        id: 'h3',
        type: SectionType.HEADING,
        level: 3,
        text: 'Linux Steps',
      };
      const {container} = render(
        <InstructionsSectionRenderer section={section} />,
      );
      expect(container.querySelector('h3')).toHaveTextContent('Linux Steps');
    });

    test('should render level-4 heading as fallback', () => {
      const section: InstructionsSection = {
        id: 'h4',
        type: SectionType.HEADING,
        level: 4,
        text: 'Details',
      };
      const {container} = render(
        <InstructionsSectionRenderer section={section} />,
      );
      expect(container.querySelector('h4')).toHaveTextContent('Details');
    });
  });

  describe('PARAGRAPH', () => {
    test('should render paragraph text', () => {
      const section: InstructionsSection = {
        id: 'para-1',
        type: SectionType.PARAGRAPH,
        text: 'Run the installer script below.',
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(
        screen.getByText('Run the installer script below.'),
      ).toBeInTheDocument();
    });
  });

  describe('OS_COMMAND', () => {
    test('should render command without download', () => {
      const section: InstructionsSection = {
        id: 'linux-cmd',
        type: SectionType.OS_COMMAND,
        os: 'linux',
        command: 'curl -sSL https://example.com/install.sh | bash',
      };
      render(<InstructionsSectionRenderer section={section} />);
      const wrapper = screen.getByTestId('command-linux');
      expect(
        within(wrapper).getByText(
          'curl -sSL https://example.com/install.sh | bash',
        ),
      ).toBeInTheDocument();
    });

    test('should render windows command without download', () => {
      const section: InstructionsSection = {
        id: 'win-cmd',
        type: SectionType.OS_COMMAND,
        os: 'windows',
        command: 'powershell -Command "..."',
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.getByTestId('command-windows')).toBeInTheDocument();
    });

    test('should render command with download button', () => {
      const section: InstructionsSection = {
        id: 'win-cmd-dl',
        type: SectionType.OS_COMMAND,
        os: 'windows',
        command: 'install.ps1',
        download: {
          url: 'https://example.com/install.ps1',
          filename: 'install.ps1',
          label: 'Download Script',
        },
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.getByText('Download Script')).toBeInTheDocument();
    });
  });

  describe('WARNING', () => {
    test('should render warning alert text', () => {
      const section: InstructionsSection = {
        id: 'warn-1',
        type: SectionType.WARNING,
        text: 'Self-signed certificates may cause issues.',
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(
        screen.getByText('Self-signed certificates may cause issues.'),
      ).toBeInTheDocument();
    });
  });

  describe('COLLAPSIBLE', () => {
    test('should render collapsible with summary and child content', () => {
      const section: InstructionsSection = {
        id: 'collapsible-1',
        type: SectionType.COLLAPSIBLE,
        summary: 'Advanced Options',
        children: [
          {
            id: 'child-para',
            type: SectionType.PARAGRAPH,
            text: 'Child paragraph content',
          },
        ],
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.getByText('Advanced Options')).toBeInTheDocument();
      expect(screen.getByText('Child paragraph content')).toBeInTheDocument();
    });
  });

  describe('TABLE', () => {
    test('should render table with headers and rows', () => {
      const section: InstructionsSection = {
        id: 'config-table',
        type: SectionType.TABLE,
        headers: ['Parameter', 'Value'],
        rows: [
          ['host', 'agentcontrol'],
          ['port', '8080'],
        ],
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.getByText('Parameter')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('host')).toBeInTheDocument();
      expect(screen.getByText('agentcontrol')).toBeInTheDocument();
      expect(screen.getByText('port')).toBeInTheDocument();
      expect(screen.getByText('8080')).toBeInTheDocument();
    });

    test('should linkify URLs in PACKAGES_TABLE cells', () => {
      const url = 'https://packages.example.com/agent.deb';
      const section: InstructionsSection = {
        id: SectionId.PACKAGES_TABLE,
        type: SectionType.TABLE,
        headers: ['Package', 'URL'],
        rows: [['agent-installer', url]],
      };
      render(<InstructionsSectionRenderer section={section} />);
      const link = screen.getByRole('link', {name: url});
      expect(link).toHaveAttribute('href', url);
    });

    test('should not linkify URLs in non-PACKAGES_TABLE cells', () => {
      const url = 'https://packages.example.com/agent.deb';
      const section: InstructionsSection = {
        id: 'config-table',
        type: SectionType.TABLE,
        headers: ['Package', 'URL'],
        rows: [['agent-installer', url]],
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.queryByRole('link', {name: url})).not.toBeInTheDocument();
      expect(screen.getByText(url)).toBeInTheDocument();
    });

    test('should render em dash for empty cell in PACKAGES_TABLE', () => {
      const section: InstructionsSection = {
        id: SectionId.PACKAGES_TABLE,
        type: SectionType.TABLE,
        headers: ['Package'],
        rows: [['']],
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('ORDERED_LIST', () => {
    test('should render ordered list items', () => {
      const section: InstructionsSection = {
        id: 'steps',
        type: SectionType.ORDERED_LIST,
        items: ['Step one', 'Step two', 'Step three'],
      };
      const {container} = render(
        <InstructionsSectionRenderer section={section} />,
      );
      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(3);
      expect(items[0]).toHaveTextContent('Step one');
      expect(items[1]).toHaveTextContent('Step two');
      expect(items[2]).toHaveTextContent('Step three');
    });
  });

  describe('UNORDERED_LIST', () => {
    test('should render unordered list items', () => {
      const section: InstructionsSection = {
        id: 'requirements',
        type: SectionType.UNORDERED_LIST,
        items: ['Node.js 18+', 'curl installed'],
      };
      const {container} = render(
        <InstructionsSectionRenderer section={section} />,
      );
      const items = container.querySelectorAll('li');
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent('Node.js 18+');
      expect(items[1]).toHaveTextContent('curl installed');
    });
  });

  describe('CHECKSUM', () => {
    test('should render checksum label and value', () => {
      const section: InstructionsSection = {
        id: 'checksum-linux',
        type: SectionType.CHECKSUM,
        label: 'SHA256',
        value: 'abc123def456',
      };
      render(<InstructionsSectionRenderer section={section} />);
      expect(screen.getByText(/SHA256/)).toBeInTheDocument();
      expect(screen.getByText('abc123def456')).toBeInTheDocument();
    });
  });

  describe('unknown type', () => {
    test('should render nothing for an unknown section type', () => {
      const section = {
        id: 'unknown-1',
        type: 'unknown-type',
      } as unknown as InstructionsSection;
      const {container} = render(
        <InstructionsSectionRenderer section={section} />,
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
