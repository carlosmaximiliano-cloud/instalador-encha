import { z } from "zod";
import { type StackDefinition, fqdn, username } from "./types";
import { createHash, randomBytes } from "node:crypto";

function apr1Md5(password: string, salt: string): string {
  const saltBytes = Buffer.from(salt, "utf8");
  const passBytes = Buffer.from(password, "utf8");

  const md5a = createHash("md5");
  md5a.update(passBytes);
  md5a.update(Buffer.from("$apr1$", "utf8"));
  md5a.update(saltBytes);

  const md5b = createHash("md5");
  md5b.update(passBytes);
  md5b.update(saltBytes);
  md5b.update(passBytes);
  const digestB = md5b.digest();

  let len = passBytes.length;
  while (len > 0) {
    md5a.update(digestB.subarray(0, Math.min(len, 16)));
    len -= 16;
  }

  let l = passBytes.length;
  while (l > 0) {
    if (l & 1) md5a.update(Buffer.from([0]));
    else md5a.update(passBytes.subarray(0, 1));
    l >>= 1;
  }

  let digest = md5a.digest();

  for (let i = 0; i < 1000; i++) {
    const md5c = createHash("md5");
    if (i & 1) md5c.update(passBytes); else md5c.update(digest);
    if (i % 3) md5c.update(saltBytes);
    if (i % 7) md5c.update(passBytes);
    if (i & 1) md5c.update(digest); else md5c.update(passBytes);
    digest = md5c.digest();
  }

  const to64 = (v: number, n: number): string => {
    const itoa64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    while (n-- > 0) {
      result += itoa64[v & 0x3f];
      v >>= 6;
    }
    return result;
  };

  const d = digest;
  return (
    "$apr1$" +
    salt +
    "$" +
    to64((d[0] << 16) | (d[6] << 8) | d[12], 4) +
    to64((d[1] << 16) | (d[7] << 8) | d[13], 4) +
    to64((d[2] << 16) | (d[8] << 8) | d[14], 4) +
    to64((d[3] << 16) | (d[9] << 8) | d[15], 4) +
    to64((d[4] << 16) | (d[10] << 8) | d[5], 4) +
    to64(d[11], 2)
  );
}

const schema = z.object({
  url_ntfy: fqdn,
  user_ntfy: username,
  pass_ntfy: z.string().min(1),
});

export const ntfy: StackDefinition = {
  id: "ntfy",
  repoUrl: "https://github.com/binwiederhier/ntfy",
  logoUrl: "https://raw.githubusercontent.com/binwiederhier/ntfy/main/docs/static/logo.svg",
  name: "Ntfy",
  description: "Notificações push HTTP simples para qualquer device.",
  category: "monitoring",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 46,
  installVia: "panel",
  fields: [
    { name: "url_ntfy", label: "Domínio do Ntfy", kind: "domain", placeholder: "ntfy.encha.ai", group: "Domínios" },
    { name: "user_ntfy", label: "Usuário de acesso", kind: "username", placeholder: "encha", group: "Acesso" },
    { name: "pass_ntfy", label: "Senha de acesso", kind: "password", sensitive: true, group: "Acesso" },
  ],
  schema,
  generateSecrets: (values) => {
    const v = values as z.infer<typeof schema>;
    const salt = randomBytes(4).toString("hex").slice(0, 8);
    const hashed = apr1Md5(v.pass_ntfy, salt).replace(/\$/g, "$$$$");
    const authentication = Buffer.from(`${v.user_ntfy}:${v.pass_ntfy}`).toString("base64");
    return [
      { name: "hashed_senha", value: hashed },
      { name: "authentication", value: authentication },
    ];
  },
  generateYaml(values, secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:

  ntfy:
    image: binwiederhier/ntfy:latest
    command:
      - serve
    volumes:
      - ntfy_cache:/var/cache/ntfy
      - ntfy_etc:/etc/ntfy
    networks:
      - ${net}
    environment:
      - TZ=UTC
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      resources:
        limits:
          cpus: "1"
          memory: 1024M
      labels:
        - traefik.enable=true
        - traefik.http.routers.ntfy.rule=Host(\`${v.url_ntfy}\`)
        - traefik.http.services.ntfy.loadbalancer.server.port=80
        - traefik.http.routers.ntfy.service=ntfy
        - traefik.http.routers.ntfy.tls.certresolver=letsencryptresolver
        - traefik.http.routers.ntfy.entrypoints=websecure
        - traefik.http.middlewares.ntfy-auth.basicauth.users=${v.user_ntfy}:${secrets.hashed_senha}
        - traefik.http.routers.ntfy.middlewares=ntfy-auth
        - traefik.http.routers.ntfy.tls=true

volumes:
  ntfy_cache:
    external: true
    name: ntfy_cache
  ntfy_etc:
    external: true
    name: ntfy_etc

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: {
    accessUrl: (v) => `https://${(v as z.infer<typeof schema>).url_ntfy}`,
    notes: ["Authorization para API: Basic <authentication>"],
  },
};
