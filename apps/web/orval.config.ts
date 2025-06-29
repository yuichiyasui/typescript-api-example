// eslint-disable-next-line import/no-anonymous-default-export
export default {
  api: {
    input: "http://localhost:3000/openapi.json",
    output: {
      target: "./src/lib/api.ts",
      client: "fetch",
      mode: "single",
      clean: true,
      baseUrl: "http://localhost:3000",
    },
  },
};
