/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, useCallback, useRef} from 'react';
import DOMPurify from 'dompurify';
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
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

const extractStyles = (html: string): string => {
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? `<style>${match[1]}</style>` : '';
};

const extractBody = (html: string): string => {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
};

const InstructionsContainer = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
  width: 100%;
`;

const SelectorLabel = styled.label`
  font-weight: 500;
  white-space: nowrap;
`;

const getInstructionsUrl = (
  langCode: string,
  host: string | undefined,
  port: number | undefined,
): string => {
  const encodedLang = encodeURIComponent(langCode);
  if (host && port) {
    // Proxy through nginx: /agent-proxy/{host}/{port}/api/v1/...
    // Encode host to handle IPv6 addresses and special characters safely
    const encodedHost = encodeURIComponent(host);
    return `/agent-proxy/${encodedHost}/${port}/api/v1/install-instructions?lang=${encodedLang}`;
  }
  // Fallback to local agent-control
  return `/api/v1/install-instructions?lang=${encodedLang}`;
};

const AgentInstallInstructionsPage = () => {
  const [_] = useTranslation();
  const [language] = useLanguage();
  const gmp = useGmp();
  const [instructionsHtml, setInstructionsHtml] = useState('');
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [controllersLoading, setControllersLoading] = useState(false);
  const [controllers, setControllers] = useState<Scanner[]>([]);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [selectedController, setSelectedController] = useState<
    string | undefined
  >(undefined);
  const instructionsContainerRef = useRef<HTMLDivElement>(null);

  const fetchInstructions = useCallback(
    async (lang: string, controller: Scanner | undefined) => {
      const langCode = lang.split(/[-_]/)[0] || 'en';
      const url = getInstructionsUrl(
        langCode,
        controller?.host,
        controller?.port,
      );

      try {
        setInstructionsLoading(true);
        setError(undefined);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const styles = extractStyles(html);
        const body = extractBody(html);
        // Sanitize only the body HTML to prevent XSS attacks
        // Styles are kept as-is (CSS injection is low risk compared to HTML/JS)
        const sanitizedBody = DOMPurify.sanitize(body, {
          ADD_ATTR: ['class', 'data-clipboard-text'],
          FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style'],
          FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
        });
        // Combine styles with sanitized body
        setInstructionsHtml(styles + sanitizedBody);
      } catch (err) {
        setError(err as Error);
      } finally {
        setInstructionsLoading(false);
      }
    },
    [],
  );

  const fetchControllers = useCallback(async () => {
    try {
      setControllersLoading(true);
      const response = await gmp.scanners.getAll({
        filter: Filter.fromString(`type=${AGENT_CONTROLLER_SCANNER_TYPE}`),
      });
      const scanners = response?.data ?? [];
      const agentControllers = scanners.sort((a, b) => {
        // Local agent-control first (matches docker hostname)
        const aLocal = a.host === 'agentcontrol' ? 0 : 1;
        const bLocal = b.host === 'agentcontrol' ? 0 : 1;
        if (aLocal !== bLocal) return aLocal - bLocal;
        return a?.name?.localeCompare(b?.name ?? '') ?? 0;
      });
      setControllers(agentControllers);
      const firstController = agentControllers?.[0];
      setSelectedController(firstController?.id);
      void fetchInstructions(language, firstController);
    } catch (err) {
      // If scanner fetch fails, fall back to local agent-control
      setControllers([]);
      setError(err as Error);
    } finally {
      setControllersLoading(false);
    }
  }, [gmp, fetchInstructions, language]);

  // Fetch agent-controller scanners on mount
  useEffect(() => {
    void fetchControllers();
  }, [fetchControllers]);

  // Attach click handlers to copy buttons after HTML is rendered
  // Scoped to the instructions container to avoid global event handling
  useEffect(() => {
    const container = instructionsContainerRef.current;
    if (!instructionsHtml || instructionsLoading || !container) return;

    const copyToClipboard = async (btn: HTMLButtonElement) => {
      const pre = btn.previousElementSibling;
      if (!pre) return;

      const text = pre.textContent || '';
      const originalText = btn.textContent || _('Copy');
      const copiedText = _('Copied!');

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      btn.textContent = copiedText;
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 2000);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('copy-btn')) {
        void copyToClipboard(target as HTMLButtonElement);
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [_, instructionsHtml, instructionsLoading]);

  const handleControllerChange = (value: string) => {
    setSelectedController(value);
    const controller = controllers.find(c => c.id === value);
    void fetchInstructions(language, controller);
  };

  return (
    <>
      <PageTitle title={_('Agents Installation')} />
      <Section title={_('Agents Installation')}>
        {error && !instructionsLoading && (
          <ErrorMessage
            details={error.message ?? _('Unknown error occurred')}
            message={_('Could not load install instructions')}
          >
            <Button onClick={() => fetchInstructions(language, undefined)}>
              {_('Retry')}
            </Button>
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
              value={selectedController}
              onChange={handleControllerChange}
            />
          </Row>
        )}
        {!controllersLoading && controllers.length === 0 && (
          <p>{_('No agent controllers available')}</p>
        )}
        {instructionsLoading && <Loading />}

        {!instructionsLoading && !controllersLoading && !error && (
          <InstructionsContainer
            ref={instructionsContainerRef}
            dangerouslySetInnerHTML={{__html: instructionsHtml}}
          />
        )}
      </Section>
    </>
  );
};

export default AgentInstallInstructionsPage;
