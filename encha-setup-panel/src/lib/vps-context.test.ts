import { describe, expect, it } from "vitest";
import { parseDadosVps } from "./vps-context";

// Cobre a migração das chaves de dados_vps para inglês (Fase 0 de i18n —
// i18n/GLOSSARY.md). O parser precisa aceitar a chave nova E a antiga em
// português para sempre: dados_vps só é regravado numa instalação completa
// nova, então a frota já instalada mantém a chave em português
// indefinidamente (ver runOneShotJob/updater.ts — "Atualizar" nunca reescreve
// esse arquivo).

const NOVO = `[DADOS DA VPS]
Server Name: srv-novo
Internal Network: net-novo
SSL Email: novo@x.com
Portainer Link: https://portainer.novo.com
`;

const ANTIGO = `[DADOS DA VPS]
Nome do Servidor: srv-antigo
Rede interna: net-antigo
Email para SSL: antigo@x.com
Link do Portainer: https://portainer.antigo.com
`;

describe("parseDadosVps", () => {
  it("lê a chave nova em inglês (instalação a partir da Fase 0)", () => {
    expect(parseDadosVps(NOVO)).toEqual({
      nome_servidor: "srv-novo",
      nome_rede_interna: "net-novo",
      email_ssl: "novo@x.com",
      url_portainer: "portainer.novo.com",
    });
  });

  it("lê a chave antiga em português (frota já instalada)", () => {
    expect(parseDadosVps(ANTIGO)).toEqual({
      nome_servidor: "srv-antigo",
      nome_rede_interna: "net-antigo",
      email_ssl: "antigo@x.com",
      url_portainer: "portainer.antigo.com",
    });
  });

  it("remove o https:// da URL do Portainer em ambos os formatos", () => {
    expect(parseDadosVps(NOVO).url_portainer).not.toMatch(/^https?:\/\//);
    expect(parseDadosVps(ANTIGO).url_portainer).not.toMatch(/^https?:\/\//);
  });

  it("ignora linhas sem valor e linhas que não batem com nenhuma chave conhecida", () => {
    const conteudo = `[DADOS DA VPS]
Server Name:
Alguma Chave Desconhecida: valor qualquer
Internal Network: net-x
`;
    expect(parseDadosVps(conteudo)).toEqual({ nome_rede_interna: "net-x" });
  });

  it("string vazia não quebra e devolve objeto vazio", () => {
    expect(parseDadosVps("")).toEqual({});
  });
});
