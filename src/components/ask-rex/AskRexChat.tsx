"use client";

import "@forgedevstack/bear/styles.css";
import "./ask-rex.css";
import { CloseButton } from "@forgedevstack/bear";
import { CitationList, FloatingChat, type ChatMessage } from "@forgedevstack/bear-x-ai";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ZaprexMascot } from "@/components/mascot/ZaprexMascot";
import {
  ASK_REX_COPY as COPY, ASK_REX_DOM_ID, ASK_REX_NAME, askRex, askRexErrorKey, isExternal, scrollToLatestMessage, type AskRexSource, type AskRexTurn,
} from "@/lib/ask-rex";

function AskRexHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="ask-rex-header" data-testid="ask-rex-header">
      <ZaprexMascot id="ask-rex-header" className="ask-rex-mark" decorative />
      <div className="ask-rex-heading">
        <div className="ask-rex-title-row">
          <span className="ask-rex-title">{COPY.title}</span>
          <span className="ask-rex-beta">{COPY.beta}</span>
        </div>
        <span className="ask-rex-subtitle">{COPY.subtitle}</span>
      </div>
      <CloseButton aria-label={COPY.close} onClick={onClose} className="ask-rex-close" />
    </div>
  );
}

function AskRexAnswer({ text, sources, refused }: { text: string; sources: readonly AskRexSource[]; refused: boolean }) {
  return (
    <div className="ask-rex-answer" data-testid="ask-rex-answer">
      <div className="ask-rex-text">{text}</div>
      {refused ? <Link className="ask-rex-docs" href="/docs" data-testid="ask-rex-docs">{COPY.docsLink}</Link> : null}
      {sources.length ? (
        <div className="ask-rex-sources" data-testid="ask-rex-sources">
          <span className="ask-rex-sources-label">{COPY.sources}</span>
          <CitationList citations={sources.map(source => ({ id: `${source.n}-${source.url}`, title: `[${source.n}] ${source.title}${isExternal(source.url) ? " · Ingot" : ""}`, href: source.url }))} />
        </div>
      ) : null}
    </div>
  );
}

function AskRexTrigger({ open }: { open: boolean }) {
  return (
    <button type="button" className="ask-rex-trigger" data-open={open} aria-label={open ? COPY.close : COPY.open} aria-expanded={open} data-testid="ask-rex-trigger">
      {open ? <X aria-hidden className="ask-rex-trigger-x" /> : (
        <>
          <ZaprexMascot id="ask-rex-trigger" className="ask-rex-trigger-mark" decorative />
          <span>{COPY.open}</span>
        </>
      )}
    </button>
  );
}

/** Bear X AI floating chat themed for zaprex.dev (light and dark), answering as Rex from ingot-server. */
export function AskRexChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [turns, setTurns] = useState<AskRexTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(0);

  const latest = messages[messages.length - 1];
  useEffect(() => {
    if (latest) scrollToLatestMessage(latest.sender === "bot");
  }, [latest]);

  const add = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    nextId.current += 1;
    const id = `ask-rex-${nextId.current}`;
    setMessages(list => [...list, { ...message, id }]);
  };

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy) return;
    add({ sender: "user", content: question });
    setBusy(true);
    try {
      const result = await askRex(question, turns);
      const answer = result.refused ? COPY.refusal : result.answer;
      add({ sender: "bot", name: ASK_REX_NAME, content: <AskRexAnswer text={answer} sources={result.sources} refused={result.refused} /> });
      setTurns(list => [...list, { role: "user", content: question }, { role: "assistant", content: answer }]);
    } catch (error) {
      add({ sender: "bot", name: ASK_REX_NAME, status: "error", content: <div className="ask-rex-text" data-testid="ask-rex-error">{COPY.errors[askRexErrorKey(error)]}</div> });
    } finally {
      setBusy(false);
    }
  };

  return (
    <FloatingChat
      id={ASK_REX_DOM_ID}
      className="ask-rex"
      testId="ask-rex"
      open={open}
      onOpenChange={setOpen}
      messages={messages}
      onSend={text => { void send(text); }}
      isTyping={busy}
      header={<AskRexHeader onClose={() => setOpen(false)} />}
      trigger={<AskRexTrigger open={open} />}
      welcomeMessage={COPY.welcome}
      poweredBy={COPY.disclaimer}
      translations={{ openLabel: COPY.open, closeLabel: COPY.close }}
    />
  );
}
