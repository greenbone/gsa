/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useMemo, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import styled from 'styled-components';
import Filter from 'gmp/models/filter';
import {
  type default as Scanner,
  AGENT_CONTROLLER_SCANNER_TYPE,
} from 'gmp/models/scanner';
import ErrorMessage from 'web/components/error/ErrorMessage';
import Button from 'web/components/form/Button';
import Select from 'web/components/form/Select';
import PageTitle from 'web/components/layout/PageTitle';
import Row from 'web/components/layout/Row';
import Loading from 'web/components/loading/Loading';
import Section from 'web/components/section/Section';
import useGetInstallInstructions from 'web/hooks/use-query/agent-install-instructions';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import InstructionsSectionRenderer from 'web/pages/agent-remote-installer/InstructionsSectionRenderer';

const SelectorLabel = styled.label`
  font-weight: 500;
  white-space: nowrap;
`;

const InstructionsTitle = styled.h1`
  margin: 12px 0 16px 0;
`;

const AgentInstallInstructionsPage = () => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const [selectedController, setSelectedController] = useState<
    string | undefined
  >(undefined);

  const {
    data: controllersData,
    isLoading: controllersLoading,
    error: controllersError,
  } = useQuery<Scanner[]>({
    queryKey: ['agent-controllers'],
    queryFn: async () => {
      const response = await gmp.scanners.getAll({
        filter: Filter.fromString(`type=${AGENT_CONTROLLER_SCANNER_TYPE}`),
      });
      const scanners = response?.data ?? [];
      return scanners.sort((a: Scanner, b: Scanner) => {
        const aLocal = a.host === 'agentcontrol' ? 0 : 1;
        const bLocal = b.host === 'agentcontrol' ? 0 : 1;
        if (aLocal !== bLocal) return aLocal - bLocal;
        return a?.name?.localeCompare(b?.name ?? '') ?? 0;
      });
    },
  });

  const controllers = useMemo(() => controllersData ?? [], [controllersData]);

  const activeControllerId = selectedController ?? controllers[0]?.id;
  const activeController = controllers.find(c => c.id === activeControllerId);

  const {
    data: instructions,
    isLoading: instructionsLoading,
    error: instructionsError,
    refetch: refetchInstructions,
  } = useGetInstallInstructions({
    host: activeController?.host,
    port: activeController?.port,
    enabled: !controllersLoading,
  });

  const error = controllersError ?? instructionsError;

  const handleControllerChange = (value: string) => {
    setSelectedController(value);
  };

  return (
    <>
      <PageTitle title={_('Agents Installation')} />
      {!instructionsLoading &&
        !controllersLoading &&
        !error &&
        instructions && (
          <InstructionsTitle>{instructions.title}</InstructionsTitle>
        )}
      <Section title={_('Agents Installation')}>
        {error && !instructionsLoading && (
          <ErrorMessage
            details={
              error instanceof Error
                ? error.message
                : _('Unknown error occurred')
            }
            message={_('Could not load install instructions')}
          >
            <Button onClick={() => refetchInstructions()}>{_('Retry')}</Button>
          </ErrorMessage>
        )}

        {controllers.length > 0 && (
          <Row>
            <SelectorLabel htmlFor="agent-controller-select">
              {_('Agent Controller')}:
            </SelectorLabel>
            <Select
              disabled={
                instructionsLoading ||
                controllersLoading ||
                controllers.length <= 1
              }
              grow="1"
              id="agent-controller-select"
              isLoading={controllersLoading}
              items={controllers.map(controller => ({
                label: `${controller.name} (${controller.host}:${controller.port})`,
                value: controller.id as string,
              }))}
              value={activeControllerId}
              onChange={handleControllerChange}
            />
          </Row>
        )}
        {!controllersLoading && controllers.length === 0 && (
          <p>{_('No agent controllers available')}</p>
        )}
        {(instructionsLoading || controllersLoading) && <Loading />}

        {!instructionsLoading &&
          !controllersLoading &&
          !error &&
          instructions && (
            <>
              {instructions.sections.map(section => (
                <InstructionsSectionRenderer
                  key={section.id}
                  section={section}
                />
              ))}
            </>
          )}
      </Section>
    </>
  );
};

export default AgentInstallInstructionsPage;
