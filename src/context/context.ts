type Request = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
};

type Response = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string;
};

type AddRequestOptios = {
  request: Request;
  response: Response;
  id?: string;
}

type ContextOptions = {
  input?: Record<string, unknown>;
  env?: Record<string, unknown>;
  requests?: Record<string, Request>;
  responses?: Record<string, Response>;
};

class Context {
  input: Record<string, unknown> = {};
  env: Record<string, unknown> = {};
  files: Set<string> = new Set();
  requests: Record<string, Request> = {};
  responses: Record<string, Response> = {};
  request?: Request;
  response?: Response;

  constructor(options: ContextOptions = {}) {
    this.input = options.input || {};
    this.env = options.env || {};
    this.requests = options.requests || {};
    this.responses = options.responses || {};
  }

  public addRequest(options: AddRequestOptios) {
    const { request, response, id } = options;
    if (id) {
      this.requests[id] = request;
      this.responses[id] = response;
    }
    this.request = request;
    this.response = response;
  }
}

export { Context };
