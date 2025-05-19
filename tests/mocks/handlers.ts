import { http, HttpResponse } from 'msw'

export const handlers = [
  // Intercept "GET https://example.com/user" requests...
  http.all('https://httpbin.org/*', async (req) => {
    // ...and respond to them using this JSON response.
    const bodyRaw = await req.request.text();
    let bodyJson: unknown = undefined;
    try {
      bodyJson = JSON.parse(bodyRaw);
    } catch (e) {
      // Ignore error
    }
    return HttpResponse.text(JSON.stringify({
      headers: Object.fromEntries(req.request.headers.entries()),
      data: bodyRaw,
      json: bodyJson,
    }, null, 2));
  }),
]
