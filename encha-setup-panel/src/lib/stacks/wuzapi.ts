import { z } from "zod";
import type { StackDefinition } from "./types";

export const wuzapi: StackDefinition = {
  id: "wuzapi",
  repoUrl: "https://github.com/asternic/wuzapi",
  name: "WuzAPI",
  description: "API REST e webhooks para WhatsApp via WhatsMeow.",
  category: "messaging",
  icon: "message-circle",
  dependsOn: ["traefik-portainer"],
  optionNumber: 78,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
