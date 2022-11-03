import { APIEvent } from "solid-start/api";
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
    search: new URL(request.url).search,
    body: await request.json().catch(console.error),
  };

  const res = await server.executeHTTPGraphQLRequest({
    httpGraphQLRequest: req,
    context: async () => ({}),
  });

  const resHeaders = new Headers();
  for (const [key, value] of res.headers) {
    resHeaders.set(key, value);
  }

  let body: string | ReadableStream;

  if (res.body.kind === "chunked") {
    const asyncIter = res.body.asyncIterator;
    body = new ReadableStream({
      async pull(collector) {
        try {
          const { done, value } = await asyncIter.next();
          if (done) collector.close();
          else collector.enqueue(value);
        } catch (e) {
          collector.error(e);
        }
      },
    });
  } else {
    body = res.body.string;
  }

  return new Response(body, {
    status: res.status,
    headers: resHeaders,
  });
};

export const GET = handler;

export const POST = handler;
