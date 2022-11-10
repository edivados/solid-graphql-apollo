import { APIEvent } from "solid-start/api";
import { HTTPGraphQLRequest } from "@apollo/server";
import { apolloServer } from "~/lib/apollo/server";  
  
const handler = async ({ request }: APIEvent) => {
  const reqHeaders = new Map<string, string>();
  for (const [key, value] of request.headers) {
    reqHeaders.set(key, value);
  }  
  
  const req: HTTPGraphQLRequest = {
    method: request.method.toUpperCase(),
    headers: reqHeaders,
    search: (new URL(request.url)).search,
    body: await request.json(),
  };  
  
  const res = await apolloServer.executeHTTPGraphQLRequest({
    httpGraphQLRequest: req,
    context: async () => ({}),
  });  
  
  const resHeaders = new Headers();
  for (const [key, value] of res.headers) {
    resHeaders.set(key, value);
  }  
  
  let resBody: string | ReadableStream;  
  
  if (res.body.kind === "chunked") {
    const asyncIter = res.body.asyncIterator;
    resBody = new ReadableStream({
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
    resBody = res.body.string;
  }
  
  return new Response(resBody, {
    status: res.status,
    headers: resHeaders,
  });
};  
  
export const GET = handler;
export const POST = handler;