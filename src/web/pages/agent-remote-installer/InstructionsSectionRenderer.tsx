/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {
  AccordionItem,
  AccordionWrapperMultiple,
  Alert,
  Button,
  EStatus,
} from '@greenbone/ui-lib';
import CopyToClipboard from 'web/components/clipboard/CopyToClipboard';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import BlankLink from 'web/components/link/BlankLink';
import StripedTable from 'web/components/table/StripedTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {
  BulletList,
  ChecksumBox,
  CommandWrapper,
  ConfigValue,
  InfoParagraph,
  OsCard,
  Pre,
  StepsList,
} from 'web/pages/agent-remote-installer/instructions-section-renderer-styles';
import {
  SectionId,
  SectionType,
  type InstructionsChecksum,
  type InstructionsCollapsible,
  type InstructionsOsCommand,
  type InstructionsSection,
  type InstructionsTable,
} from 'web/pages/agent-remote-installer/types';

const CopyableCommand = ({command, os}: {command: string; os: string}) => {
  return (
    <CommandWrapper data-testid={`command-${os}`}>
      <Pre>
        <code>{command}</code>
      </Pre>
      <CopyToClipboard value={command} />
    </CommandWrapper>
  );
};

const OsCommandSection = ({section}: {section: InstructionsOsCommand}) => {
  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const {download} = section;

  if (!download) {
    return <CopyableCommand command={section.command} os={section.os} />;
  }

  return (
    <OsCard>
      <CopyableCommand command={section.command} os={section.os} />
      <Row justify="flex-end" style={{marginTop: '12px'}}>
        <Button
          color="green"
          variant="filled"
          onClick={() => handleDownload(download.url, download.filename)}
        >
          {download.label}
        </Button>
      </Row>
    </OsCard>
  );
};

const CollapsibleSection = ({section}: {section: InstructionsCollapsible}) => (
  <Column gap={0} style={{margin: '16px 0'}}>
    <AccordionWrapperMultiple>
      <AccordionItem controlContent={section.summary} itemValue={section.id}>
        {section.children.map(child => (
          <InstructionsSectionRenderer key={child.id} section={child} />
        ))}
      </AccordionItem>
    </AccordionWrapperMultiple>
  </Column>
);

const InstructionsTableSection = ({section}: {section: InstructionsTable}) => (
  <StripedTable $size="full">
    <TableHeader>
      <TableRow>
        {section.headers.map(header => (
          <TableHead key={header} title={header} />
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {section.rows.map(row => (
        <TableRow key={row.join('||')}>
          {row.map(cell => (
            <TableData key={cell}>
              <ConfigValue>
                {renderCellContent(
                  cell,
                  section.id === SectionId.PACKAGES_TABLE,
                )}
              </ConfigValue>
            </TableData>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </StripedTable>
);

const URL_PATTERN = /https?:\/\/[^\s,]+/g;

const renderCellContent = (cell: string, shouldLinkify: boolean): ReactNode => {
  if (!cell) return '—';
  if (!shouldLinkify) return cell;

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  URL_PATTERN.lastIndex = 0;
  while ((match = URL_PATTERN.exec(cell)) !== null) {
    if (match.index > lastIndex) {
      parts.push(cell.slice(lastIndex, match.index));
    }
    parts.push(
      <BlankLink key={match.index} to={match[0]}>
        {match[0]}
      </BlankLink>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < cell.length) parts.push(cell.slice(lastIndex));
  return parts.length > 0 ? parts : cell;
};

const ChecksumSection = ({section}: {section: InstructionsChecksum}) => (
  <div>
    <strong>{section.label}: </strong>
    <ChecksumBox>{section.value}</ChecksumBox>
  </div>
);

const InstructionsSectionRenderer = ({
  section,
}: {
  section: InstructionsSection;
}) => {
  switch (section.type) {
    case SectionType.HEADING: {
      if (section.level === 2) return <h2>{section.text}</h2>;
      if (section.level === 3) return <h3>{section.text}</h3>;
      return <h4>{section.text}</h4>;
    }
    case SectionType.PARAGRAPH:
      return <InfoParagraph>{section.text}</InfoParagraph>;
    case SectionType.OS_COMMAND:
      return <OsCommandSection section={section} />;
    case SectionType.WARNING:
      return (
        <Column gap={0} style={{margin: '8px 0 16px 0'}}>
          <Alert text={section.text} title="" type={EStatus.WARNING} />
        </Column>
      );
    case SectionType.COLLAPSIBLE:
      return <CollapsibleSection section={section} />;
    case SectionType.TABLE:
      return <InstructionsTableSection section={section} />;
    case SectionType.ORDERED_LIST:
      return (
        <StepsList>
          {section.items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </StepsList>
      );
    case SectionType.UNORDERED_LIST:
      return (
        <BulletList>
          {section.items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </BulletList>
      );
    case SectionType.CHECKSUM:
      return <ChecksumSection section={section} />;
    default:
      return null;
  }
};

export default InstructionsSectionRenderer;
