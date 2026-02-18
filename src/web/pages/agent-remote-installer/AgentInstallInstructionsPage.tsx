/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from 'react';
import {Spinner} from '@greenbone/ui-lib';
import DOMPurify from 'dompurify';
import styled from 'styled-components';
import {
  type default as Scanner,
  AGENT_CONTROLLER_SCANNER_TYPE,
} from 'gmp/models/scanner';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import useGmp from 'web/hooks/useGmp';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

interface AgentController {
  id: string;
  name: string;
  host: string;
  port: number;
}

const extractStyles = (html: string): string => {
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? `<style>${match[1]}</style>` : '';
};

const extractBody = (html: string): string => {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : html;
};

const CenteredLayout = styled(Layout)`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
`;

const InstructionsContainer = styled.div`
  padding: 16px;
  background: white;
  border-radius: 8px;
  width: 100%;
`;

const SelectorBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SelectorLabel = styled.label`
  font-weight: 500;
  white-space: nowrap;
`;

const SelectorSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 250px;
`;

const ErrorContainer = styled.div`
  padding: 24px;
  background: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 8px;
  margin: 16px 0;
`;

const ErrorTitle = styled.h3`
  color: #c62828;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  color: #b71c1c;
  margin: 0 0 16px 0;
`;

const RetryButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #45a049;
  }
`;

const AgentInstallInstructionsPage = () => {
  const [_] = useTranslation();
  const [language] = useLanguage();
  const gmp = useGmp();
  const [instructionsHtml, setInstructionsHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controllers, setControllers] = useState<AgentController[]>([]);
  const [selectedController, setSelectedController] = useState<string>('');
  const [controllersLoading, setControllersLoading] = useState(true);
  const instructionsContainerRef = useRef<HTMLDivElement>(null);

  // Fetch agent-controller scanners on mount
  useEffect(() => {
    const fetchScanners = async () => {
      try {
        const response = await gmp.scanners.getAll();
        const scanners = response?.data ?? [];
        const agentControllers: AgentController[] = scanners
          .filter(
            (s: Scanner) =>
              String(s.scannerType) === AGENT_CONTROLLER_SCANNER_TYPE &&
              s.id !== undefined &&
              s.name !== undefined &&
              s.host !== undefined,
          )
          .map((s: Scanner) => ({
            id: s.id as string,
            name: s.name as string,
            host: s.host as string,
            port: s.port ?? 443,
          }))
          .sort((a, b) => {
            // Local agent-control first (matches docker hostname)
            const aLocal = a.host === 'agentcontrol' ? 0 : 1;
            const bLocal = b.host === 'agentcontrol' ? 0 : 1;
            if (aLocal !== bLocal) return aLocal - bLocal;
            return a.name.localeCompare(b.name);
          });
        setControllers(agentControllers);
        if (agentControllers.length > 0) {
          setSelectedController(agentControllers[0].id);
        }
      } catch {
        // If scanner fetch fails, fall back to local agent-control
        setControllers([]);
      } finally {
        setControllersLoading(false);
      }
    };
    void fetchScanners();
  }, [gmp]);

  const getInstructionsUrl = useCallback(
    (langCode: string) => {
      const controller = controllers.find(c => c.id === selectedController);
      const encodedLang = encodeURIComponent(langCode);
      if (controller) {
        // Proxy through nginx: /agent-proxy/{host}/{port}/api/v1/...
        // Encode host to handle IPv6 addresses and special characters safely
        const encodedHost = encodeURIComponent(controller.host);
        return `/agent-proxy/${encodedHost}/${controller.port}/api/v1/install-instructions?lang=${encodedLang}`;
      }
      // Fallback to local agent-control
      return `/api/v1/install-instructions?lang=${encodedLang}`;
    },
    [controllers, selectedController],
  );

  const fetchInstructions = useCallback(
    async (lang: string) => {
      const langCode = lang.split(/[-_]/)[0] || 'en';
      const url = getInstructionsUrl(langCode);

      try {
        setLoading(true);
        setError(null);

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
        setError(
          err instanceof Error ? err.message : _('Unknown error occurred'),
        );
      } finally {
        setLoading(false);
      }
    },
    [_, getInstructionsUrl],
  );

  // Fetch instructions when language or selected controller changes
  useEffect(() => {
    if (language && !controllersLoading) {
      void fetchInstructions(language);
    }
  }, [language, selectedController, controllersLoading, fetchInstructions]);

  // Attach click handlers to copy buttons after HTML is rendered
  // Scoped to the instructions container to avoid global event handling
  useEffect(() => {
    const container = instructionsContainerRef.current;
    if (!instructionsHtml || loading || !container) return;

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
  }, [_, instructionsHtml, loading]);

  const handleControllerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedController(e.target.value);
  };

  return (
    <>
      <PageTitle title={_('Agents Installation')} />
      <Layout flex="column">
        {controllers.length > 1 && (
          <SelectorBar>
            <SelectorLabel htmlFor="agent-controller-select">
              {_('Agent Controller')}:
            </SelectorLabel>
            <SelectorSelect
              disabled={loading}
              id="agent-controller-select"
              value={selectedController}
              onChange={handleControllerChange}
            >
              {controllers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.host}:{c.port})
                </option>
              ))}
            </SelectorSelect>
          </SelectorBar>
        )}

        {(loading || controllersLoading) && (
          <CenteredLayout>
            <Spinner />
          </CenteredLayout>
        )}

        {error && !loading && (
          <ErrorContainer>
            <ErrorTitle>{_('Could not load install instructions')}</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <RetryButton onClick={() => fetchInstructions(language)}>
              {_('Retry')}
            </RetryButton>
          </ErrorContainer>
        )}

        {!loading && !controllersLoading && !error && (
          <InstructionsContainer
            ref={instructionsContainerRef}
            dangerouslySetInnerHTML={{__html: instructionsHtml}}
          />
        )}
      </Layout>
    </>
  );
};

export default AgentInstallInstructionsPage;
