import type { ReactNode } from "react";

// Renderizador de markdown minimalista, sem dependência nova (marked/react-markdown
// somariam dezenas de KB a uma imagem que roda em VPS de cliente, para um único uso:
// o texto dos Termos de Uso, autorado pelo admin da Encha — fonte confiável, mas ainda
// assim tratado como dado: isto devolve nós React, nunca dangerouslySetInnerHTML.
//
// Suporte: #/##/### , listas - * e 1., **negrito**, _itálico_, [texto](url) com href
// restrito a https:/mailto:, parágrafos. Qualquer coisa fora disso vira texto literal.

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let i = 0;
  const re = /\*\*(.+?)\*\*|_(.+?)_|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/;

  while (rest.length) {
    const m = re.exec(rest);
    if (!m) {
      nodes.push(rest);
      break;
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    if (m[1] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`}>{m[1]}</strong>);
    } else if (m[2] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-${i++}`}>{m[2]}</em>);
    } else if (m[3] !== undefined && m[4] !== undefined) {
      nodes.push(
        <a
          key={`${keyPrefix}-${i++}`}
          href={m[4]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-coral-600 underline"
        >
          {m[3]}
        </a>
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return nodes;
}

export function renderMarkdown(source: string): ReactNode {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listBuf: { ordered: boolean; items: string[] } | null = null;
  let paraBuf: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (!paraBuf.length) return;
    blocks.push(<p key={`p-${key++}`}>{renderInline(paraBuf.join(" "), `p-${key}`)}</p>);
    paraBuf = [];
  };
  const flushList = () => {
    if (!listBuf) return;
    const Tag = listBuf.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={`l-${key++}`} className={listBuf.ordered ? "list-decimal pl-5" : "list-disc pl-5"}>
        {listBuf.items.map((it, idx) => (
          <li key={idx}>{renderInline(it, `li-${key}-${idx}`)}</li>
        ))}
      </Tag>
    );
    listBuf = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      const cls = level === 1 ? "text-lg font-semibold mt-3" : "font-semibold mt-2";
      const content = renderInline(heading[2], `h-${key}`);
      blocks.push(
        level === 1 ? (
          <h2 key={`h-${key++}`} className={cls}>
            {content}
          </h2>
        ) : (
          <h3 key={`h-${key++}`} className={cls}>
            {content}
          </h3>
        )
      );
      continue;
    }

    const ordered = /^\d+\.\s+(.*)$/.exec(line);
    const unordered = /^[-*]\s+(.*)$/.exec(line);
    if (ordered || unordered) {
      flushParagraph();
      const isOrdered = !!ordered;
      const item = (ordered ?? unordered)![1];
      if (!listBuf || listBuf.ordered !== isOrdered) {
        flushList();
        listBuf = { ordered: isOrdered, items: [] };
      }
      listBuf.items.push(item);
      continue;
    }

    flushList();
    paraBuf.push(line.trim());
  }
  flushParagraph();
  flushList();

  return <>{blocks}</>;
}
