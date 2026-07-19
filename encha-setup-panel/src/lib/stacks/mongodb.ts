import { z } from "zod";
import { type StackDefinition, fqdn, username, strongPassword } from "./types";

const schema = z.object({
  url_mongo_express: fqdn,
  usuario_mongo: username,
  senha_mongo: strongPassword,
});

export const mongodb: StackDefinition = {
  id: "mongodb",
  repoUrl: "https://github.com/mongodb/mongo",
  logoUrl: "https://raw.githubusercontent.com/mongodb-js/leaf_cms/master/public/images/mongodb-leaf.png",
  name: "MongoDB + Mongo Express",
  description: "Banco NoSQL MongoDB + UI Mongo Express para gerenciamento visual.",
  category: "database",
  icon: "database-zap",
  dependsOn: ["traefik-portainer"],
  optionNumber: 15,
  externalVolumes: ["mongodb_data"],
  fields: [
    { name: "url_mongo_express", label: "Domínio do Mongo Express (UI)", kind: "domain", placeholder: "mongo.suaempresa.com", group: "Domínios" },
    { name: "usuario_mongo", label: "Usuário admin", kind: "username", group: "Credenciais" },
    { name: "senha_mongo", label: "Senha admin", kind: "password", sensitive: true, group: "Credenciais" },
  ],
  schema,
  generateYaml(values, _secrets, ctx) {
    const v = values as z.infer<typeof schema>;
    const net = ctx.networkName;
    return `version: "3.7"
services:
  mongodb:
    image: mongo:latest
    networks:
      - ${net}
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${v.usuario_mongo}
      - MONGO_INITDB_ROOT_PASSWORD=${v.senha_mongo}
    volumes:
      - mongodb_data:/data/db
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager

  mongo_express:
    image: mongo-express:latest
    networks:
      - ${net}
    environment:
      - ME_CONFIG_MONGODB_ADMINUSERNAME=${v.usuario_mongo}
      - ME_CONFIG_MONGODB_ADMINPASSWORD=${v.senha_mongo}
      - ME_CONFIG_MONGODB_URL=mongodb://${v.usuario_mongo}:${v.senha_mongo}@mongodb:27017/
      - ME_CONFIG_BASICAUTH_USERNAME=${v.usuario_mongo}
      - ME_CONFIG_BASICAUTH_PASSWORD=${v.senha_mongo}
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.mongo_express.rule=Host(\`${v.url_mongo_express}\`)
        - traefik.http.routers.mongo_express.entrypoints=websecure
        - traefik.http.routers.mongo_express.tls.certresolver=letsencryptresolver
        - traefik.http.services.mongo_express.loadbalancer.server.port=8081

volumes:
  mongodb_data:
    external: true
    name: mongodb_data

networks:
  ${net}:
    external: true
    name: ${net}
`;
  },
  postInstall: { accessUrl: (v) => `https://${(v as { url_mongo_express: string }).url_mongo_express}` },
};
