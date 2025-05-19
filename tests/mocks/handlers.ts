import { http, HttpResponse } from 'msw';

export const handlers = [
  http.all('https://httpbin.org/*', async (req) => {
    const bodyRaw = await req.request.text();
    let bodyJson: unknown = undefined;
    try {
      bodyJson = JSON.parse(bodyRaw);
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    } catch (e) {
      // Ignore error
    }
    return HttpResponse.text(
      JSON.stringify(
        {
          headers: Object.fromEntries(req.request.headers.entries()),
          data: bodyRaw,
          json: bodyJson,
        },
        null,
        2,
      ),
    );
  }),
];
