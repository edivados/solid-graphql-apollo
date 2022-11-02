import { APIEvent } from "solid-start/api";
import { parse as parseUrl } from "url";
import { HTTPGraphQLRequest } from "@apollo/server";
import { server } from "~/lib/apollo/server";

const handler = async ({ request }: APIEvent) => {
  const reqHeaders = new Map<string, string>();
  for (const [key, value] of request.headers) {
    reqHeaders.set(key, value);
  }

  const req: HTTPGraphQLRequest = {
    method: request.method.toUpperCase(),
    headers: reqHeaders,
    search: parseUrl(request.url).search ?? "",
    body: await request.json(),
  };

  const res = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: req,
    context: async () => ({}),
  });

  const resHeaders = new Headers();
  for (const [key, value] of res.headers) {
    resHeaders.set(key, value);
  }

  if (res.body.kind === "chunked") {
    // TODO: Handle chunked transfer-encoding.
    return new Response("Chunked transfer-encoding not supported.", { status: 500 });
  }

  return new Response(res.body.string, {
    status: res.status,
    headers: resHeaders,
  });
};

export const GET = handler;

export const POST = handler;
