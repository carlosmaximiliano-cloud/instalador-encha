import { z } from "zod";
import type { StackDefinition } from "./types";

export const rabbitmq: StackDefinition = {
  id: "rabbitmq",
  repoUrl: "https://github.com/rabbitmq/rabbitmq-server",
  name: "RabbitMQ",
  description: "Message broker AMQP usado por sistemas distribuídos.",
  category: "monitoring",
  icon: "workflow",
  dependsOn: ["traefik-portainer"],
  optionNumber: 16,
  installVia: "bash",
  fields: [],
  schema: z.object({}),
  generateYaml: () => "",
};
