import { describe, expect, it } from "vitest";
import { ALL_STACKS } from "./registry";
import { falhasDoCampo } from "../validacao-campos";

// Painel P1 — amarra o veredito do CLIENTE (validacao-campos.ts) ao do
// SERVIDOR (o schema zod de cada stack). Para cada campo com `regra`, cada
// sonda tem que ser aceita/recusada igual dos dois lados. É este teste que
// pega a deriva da cópia de SENHA_CARACTERES_PROIBIDOS (encha-tracker.ts).

type Campo = (typeof ALL_STACKS)[number]["fields"][number];

const BASE = "Aa1!aaaaaaaa";

function sondas(): string[] {
  const lista = ["", "a", "Aa1!aaaaaaa", BASE, "aa1!aaaaaaaa", "AA1!AAAAAAAA", "Aa!!aaaaaaaa", "Aa1aaaaaaaaa"];
  const meio = "SenhaForte#123";
  const nucleo = Math.floor(meio.length / 2);
  const inserir = (c: string) => meio.slice(0, nucleo) + c + meio.slice(nucleo);
  for (let code = 0x20; code <= 0x7e; code++) lista.push(inserir(String.fromCharCode(code)));
  for (const c of ["\t", "\r", "\n", "ç", "Ç", "€", "😀"]) lista.push(inserir(c));
  return lista;
}

function servidorRejeita(stack: (typeof ALL_STACKS)[number], campo: Campo, sonda: string): boolean {
  const r = stack.schema.safeParse({ [campo.name]: sonda });
  if (r.success) return false;
  return r.error.issues.some((i) => i.path[0] === campo.name);
}

// Assinatura de "senha forte" no servidor (a mesma da sondagem que motivou o
// ciclo): aceita "Aa1!aaaaaaaa", recusa "Aa1!aaaaaaa" e recusa "aa1!aaaaaaaa".
function pareceSenhaForte(stack: (typeof ALL_STACKS)[number], campo: Campo): boolean {
  return (
    !servidorRejeita(stack, campo, "Aa1!aaaaaaaa") &&
    servidorRejeita(stack, campo, "Aa1!aaaaaaa") &&
    servidorRejeita(stack, campo, "aa1!aaaaaaaa")
  );
}

const CAMPOS_COM_REGRA = ALL_STACKS.flatMap((stack) =>
  stack.fields.filter((f) => f.regra).map((campo) => ({ stack, campo }))
);

describe("registro — regra de campo declarada x schema do servidor (Painel P1)", () => {
  it("todo campo com regra: o veredito do cliente é o mesmo do schema do servidor, para cada sonda", { timeout: 30_000 }, () => {
    expect(CAMPOS_COM_REGRA.length).toBeGreaterThan(0);
    const divergencias: string[] = [];
    for (const { stack, campo } of CAMPOS_COM_REGRA) {
      for (const sonda of sondas()) {
        const servidor = servidorRejeita(stack, campo, sonda);
        const cliente = falhasDoCampo(campo, sonda).length > 0;
        if (servidor !== cliente) {
          divergencias.push(
            `${stack.id}.${campo.name} sonda ${JSON.stringify(sonda)}: servidor ${servidor ? "recusa" : "aceita"}, cliente ${cliente ? "recusa" : "aceita"}`
          );
        }
      }
    }
    expect(divergencias).toEqual([]);
  });

  it("todo campo que o servidor trata como senha forte declara regra", { timeout: 30_000 }, () => {
    const achados: string[] = [];
    const semRegra: string[] = [];
    for (const stack of ALL_STACKS) {
      for (const campo of stack.fields) {
        if (campo.kind === "checkbox") continue;
        if (!pareceSenhaForte(stack, campo)) continue;
        achados.push(`${stack.id}.${campo.name}`);
        if (!campo.regra) semRegra.push(`${stack.id}.${campo.name}`);
      }
    }
    expect(semRegra).toEqual([]);
    expect(achados.sort()).toEqual(
      [
        "traefik-portainer.pass_portainer",
        "minio.senha_minio",
        "directus.senha_admin",
        "pgadmin.senha_pgadmin",
        "mongodb.senha_mongo",
        "encha-tracker.senha_admin",
        "supabase.pass_supabase",
        "clickhouse.pass_clickhouse",
      ].sort()
    );
    // E só o Tracker usa a variante com a recusa de caracteres do YAML.
    const yaml = CAMPOS_COM_REGRA.filter(({ campo }) => campo.regra === "senha_forte_yaml").map(
      ({ stack, campo }) => `${stack.id}.${campo.name}`
    );
    expect(yaml).toEqual(["encha-tracker.senha_admin"]);
  });
});
