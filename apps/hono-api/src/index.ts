import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/tasks", (c) => {
  return c.json({
    items: [
      { id: 1, name: "Task 1" },
      { id: 2, name: "Task 2" },
      { id: 3, name: "Task 3" },
    ],
  });
});

serve({
  fetch: app.fetch,
  port: 3000,
});
