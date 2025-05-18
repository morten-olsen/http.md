# http.md Documentation

**`http.md` is a powerful tool that transforms your markdown files into living, executable API documentation and testing suites. Write your HTTP requests directly within markdown, see their responses, and use templating to build dynamic examples and test flows.**

It allows developers to create API documentation that is always accurate and up-to-date because the documentation itself _is_ the set of executable requests. This ensures that your examples work and your tests run directly from the documents you share.

## Key Features

- **Markdown-Native:** Define HTTP requests using familiar markdown code blocks.
- **Live Requests:** Execute requests and embed their responses directly into your documentation.
- **Templating:** Use Handlebars syntax to chain requests, extract data from responses, and use external inputs.
- **File Embedding:** Include and reuse requests from other markdown files.
- **Terminal & File Output:** View live previews in your terminal or build static markdown files for sharing or static site generation.
- **Watch Mode:** Automatically re-render documents on file changes for a fast development loop.
- **Flexible Configuration:** Control request execution, output formatting, and visibility.

## Use Cases

- **API Documentation:** Create clear, executable examples that users can trust.
- **Integration Testing:** Write simple integration test suites that verify API behavior.
- **Tutorials & Guides:** Build step-by-step guides where each HTTP interaction is shown with its real output.
- **Rapid Prototyping:** Quickly experiment with APIs and document your findings.

## Installation

Install `http.md` globally using npm:

```shell
npm i -g @morten-olsen/httpmd
```

## Getting Started

### Your First Request

`http.md` documents are written using an extended markdown format. To make an HTTP request, you define it within a `http` code block. To display the response from the most recent request, you use the `::response` directive.

Create a file named `example.md`:

````markdown
# My API Document

Let's make a POST request to httpbin.org.

```http
POST https://httpbin.org/post
Content-Type: application/json

{"greeting": "Hello, http.md!"}
```

And here is the response:

::response
````

### Rendering Documents

You have two primary ways to render your `http.md` file:

1. **Live Terminal Output (`dev`):**
   For a development server that outputs to your terminal and watches for changes:

   ```shell
   httpmd dev example.md
   ```

   With watch mode:

   ```shell
   httpmd dev --watch example.md
   ```

   This command will process `example.md`, execute the HTTP requests, and print the resulting markdown (with responses filled in) to the terminal. With `--watch`, any changes to `example.md` will trigger a re-run.

2. **Building Static Files (`build`):**
   To generate a new markdown file with the responses and templated values rendered:

   ```shell
   httpmd build example.md output.md
   ```

   With watch mode:

   ```shell
   httpmd build --watch example.md output.md
   ```

   This creates `output.md`, which is a static snapshot of `example.md` after all requests have been executed and templating applied. This file is suitable for version control, sharing, or integration with static site generators.

**Example Output (`output.md` or terminal output):**

````markdown
# My API Document

Let's make a POST request to httpbin.org.

```http
POST https://httpbin.org/post
Content-Type: application/json

{"greeting": "Hello, http.md!"}
```

And here is the response:

```
HTTP/200 OK
access-control-allow-credentials: true
access-control-allow-origin: *
connection: keep-alive
content-length: 559
content-type: application/json
date: Sun, 18 May 2025 18:31:46 GMT
server: gunicorn/19.9.0

{
  "args": {},
  "data": "{\"greeting\": \"Hello, http.md!\"}",
  "files": {},
  "form": {},
  "headers": {
    "Accept": "*/*",
    "Accept-Encoding": "br, gzip, deflate",
    "Accept-Language": "*",
    "Content-Length": "31",
    "Content-Type": "application/json",
    "Host": "httpbin.org",
    "Sec-Fetch-Mode": "cors",
    "User-Agent": "node",
    "X-Amzn-Trace-Id": "Root=1-682a2792-7df702ce77a3b3696937eaeb"
  },
  "json": {
    "greeting": "Hello, http.md!"
  },
  "url": "https://httpbin.org/post"
}

```
````

_(Note: Actual headers and some response fields might vary.)_

## Core Concepts

### HTTP Request Blocks

HTTP requests are defined in fenced code blocks annotated with `http`. The syntax is similar to the raw HTTP format:

```
<METHOD> <URL>
<Header-Name>: <Header-Value>
...
<Blank Line>
<Request Body (optional)>
```

**Example:**

````markdown
```http
GET https://api.example.com/items
Accept: application/json
X-Custom-Header: MyValue
```
````

````markdown
```http
POST https://api.example.com/users
Content-Type: application/json

{"name": "John Doe", "email": "john.doe@example.com"}
```
````

All requests in a document are executed sequentially from top to bottom by default.

### The `::response` Directive

The `::response` directive is used to render the full HTTP response (status line, headers, and body) of an HTTP request.

- **Implicit Last:** If used without any arguments (i.e., `::response`), it renders the response of the most recently defined `http` block above it.
- **Explicit by ID:** You can render the response of a specific request by referencing its ID (see [Request IDs](https://www.google.com/search?q=%23request-ids)).

### Request IDs

You can assign a unique ID to an `http` request block. This allows you to:

1. Reference its specific response in a `::response` directive.
2. Access its request and response data in [Templating](https://www.google.com/search?q=%23templating-with-handlebars) via the `requests` and `responses` dictionaries.

To add an ID, include `id=yourUniqueId` in the `http` block's info string:

````markdown
# Document with Multiple Requests

First, create a resource:

```http id=createUser
POST https://httpbin.org/post
Content-Type: application/json

{"username": "alpha"}
```

Then, fetch a different resource:

```http id=getItem
GET https://httpbin.org/get?item=123
```

Response from creating the user:
::response{#createUser}

Response from getting the item:
::response{#getItem}
````

## Templating with Handlebars

`http.md` uses [Handlebars](https://handlebarsjs.com/) for templating, allowing you to create dynamic content within your markdown files. You can inject data from request responses, input variables, and other requests into your HTTP blocks or general markdown text.

Templating syntax uses double curly braces: `{{expression}}`.

### Available Variables for Templating

Within your markdown document, the following variables are available in the Handlebars context:

- **`request`** (Object): Details of the most recently processed HTTP request _before_ it's sent.

  - `request.method` (String): The HTTP method (e.g., "GET", "POST").
  - `request.url` (String): The request URL.
  - `request.headers` (Object): An object containing request headers.
  - `request.body` (String): The raw request body.

- **`response`** (Object): Details of the most recently received HTTP response.

  - `response.status` (Number): The HTTP status code (e.g., 200, 404).
  - `response.statusText` (String): The HTTP status message (e.g., "OK", "Not Found").
  - `response.headers` (Object): An object containing response headers.
  - `response.body` (String/Object): The response body. If the `http` block had the `json` option and the response was valid JSON, this will be a parsed JSON object. Otherwise, it's a raw string.
  - `response.rawBody` (String): The raw response body as a string, regardless of parsing.
  - _(In case of network errors or non-HTTP errors, `status` and `body` might reflect error information.)_

- **`requests`** (Object): A dictionary mapping request IDs to their respective `request` objects (as defined above).

  - Example: `{{requests.createUser.url}}`

- **`responses`** (Object): A dictionary mapping request IDs to their respective `response` objects (as defined above).

  - Example: `{{responses.createUser.status}}`, `{{responses.createUser.body.id}}` (if `body` is a parsed JSON object).

- **`input`** (Object): A dictionary of variables passed to `http.md` via the command line using the `-i` or `--input` flag.

  - Example: If you run `httpmd dev -i userId=123 -i apiKey=secret myfile.md`, you can use `{{input.userId}}` and `{{input.apiKey}}`.

### Templating Examples

**1. Using a value from a previous response in a new request:**

````markdown
```http id=createItem json
POST https://httpbin.org/post
Content-Type: application/json

{"name": "My New Item"}
```

The new item ID is: {{responses.createItem.body.json.name}}

Now, let's fetch the item using a (mocked) ID from the response:

```http id=fetchItem
GET https://httpbin.org/anything/{{responses.createItem.body.json.name}}
```

::response{#fetchItem}
````

_(Note: `httpbin.org/post` wraps the JSON sent in a "json" field in its response. If your API returns the ID directly at the root of the JSON body, you'd use `{{responses.createItem.body.id}}` assuming the `createItem` request had the `json` option.)_

**2. Displaying a status code in markdown text:**

````markdown
```http
GET https://httpbin.org/status/201
```

The request to `/status/201` completed with status code: \*\*\*\*.
````

## Managing Documents

### Embedding Other Documents (`::md`)

You can embed other `.md` files into your current document using the `::md` directive. This is useful for breaking down large documentation into smaller, reusable parts, or for including a set of common requests.

The requests from the embedded document are processed, and their `request` and `response` objects become available in the `requests` and `responses` dictionaries of the parent document, keyed by their IDs (if any).

**Syntax:** `::md[./path/to/other-document.md]`

**Example:**

Assume `_shared_requests.md` contains:

````markdown
```http id=sharedGetRequest
GET https://httpbin.org/get
```
````

Then, in `main.md`:

````markdown
# Main Document

Let's include some shared requests:

::md[./_shared_requests.md]

The shared GET request returned:

Now, a request specific to this document:

```http
POST https://httpbin.org/post
Content-Type: application/json

{"dataFromMain": "someValue", "sharedUrl": ""}
```

::response
````

When `main.md` is processed, `_shared_requests.md` will be embedded, its `sharedGetRequest` will be executed, and its data will be available for templating.

## Advanced Usage

### Using Input Variables

You can pass external data into your `http.md` documents using the `-i` (or `--input`) CLI flag. This is useful for parameterizing requests with environment-specific values, user inputs, or sensitive data.

**CLI Command:**

```shell
httpmd build mydoc.md output.md -i baseUrl=https://api.production.example.com -i apiKey=YOUR_SECRET_KEY
```

**Markdown Usage (`mydoc.md`):**

````markdown
```http
GET /users/1
Authorization: Bearer
```

::response
````

**Security Note:** For sensitive data like API keys, using input variables is highly recommended over hardcoding them in your markdown files. Avoid committing files with plaintext secrets; instead, provide them at runtime via the CLI.

### HTTP Block Configuration Options

You can configure the behavior of each `http` code block by adding options to its info string, separated by commas.

- `id={your-id}`: Assigns a unique ID to the request. This ID can be used to reference the request's response in the `::response` directive and in templating variables (`requests.your-id`, `responses.your-id`).

  - Example: ` ```http id=getUser,json `

- `json`: If present, `http.md` will attempt to parse the **response body** as JSON. If successful, `response.body` (and `responses.id.body`) will be the parsed JavaScript object/array, making it easier to access its properties in templates (e.g., `{{response.body.fieldName}}`).

  - Example: ` ```http json `

- `yaml`: If present, the **request body** written in YAML format within the code block will be automatically converted to JSON before the request is sent. This allows for writing complex request bodies in a more human-readable YAML syntax. You should still set the `Content-Type` header appropriately (e.g., to `application/json`) if the server expects JSON.

  - Example:

    ````markdown
    ```http yaml
    POST https://api.example.com/submit
    Content-Type: application/json

    # This is YAML
    name: Example User
    details:
      age: 30
      city: New York
    ```
    ````

- `disable`: If present, the HTTP request will **not** be executed. No actual network call will be made. The corresponding `response` variable will be undefined or empty, and `::response` will typically render a "Request disabled" message or similar.

  - Example: ` ```http disable `

- `hidden`: If present, the `http` code block itself will **not be included** in the rendered output document. However, the request _is still made_ (unless `disable` is also specified), and its response data can be used in templates or displayed with an explicit `::response{#id}` directive. This is useful for prerequisite requests (like authentication) whose details you don't want to clutter the main documentation.

  - Example: ` ```http id=authRequest,hidden `

**Combined Example:**

````markdown
```http id=complexRequest,json,yaml,hidden
POST /data
X-API-Key:
Content-Type: application/json

# Request body written in YAML, will be converted to JSON
# This entire block will be hidden in the output, but the request runs
# The response will be parsed as JSON
user:
  id: 123
  preferences:
    theme: dark
```
````

### Directive Options

Directives can also have options, specified similarly.

#### `::response` Directive Options

- `id={id}` (or `#{id}` as a shorthand): Renders the output of a specific request identified by `{id}`.
  - Example: `::response{#getUser}` or `::response{id=getUser}`
- `yaml`: Renders the (typically JSON) response body formatted as YAML. This is for display purposes.
  - Example: `::response{yaml}`
- `truncate={chars}`: Truncates the displayed **response body** to the specified number of characters. Headers and status line are not affected.
  - Example: `::response{truncate=100}`

**Combined Example for `::response`:**
`::response{#getUser,yaml,truncate=500}` - Displays the response for request `getUser`, formats its body as YAML, and truncates the body display to 500 characters.

#### `::md[{file}]` Directive Options

The `::md` directive embeds another markdown document.

- **File Path:** The first argument (required) is the path to the markdown file to embed.
  - Example: `::md[./includes/authentication.md]`
- `hidden`: If present, the actual content (markdown) of the embedded document will not be rendered in the output. However, any `http` requests within the embedded document _are still processed_, and their `request` and `response` data become available in the parent document's templating context (via `requests.id` and `responses.id`). This is useful if you only want to execute the requests from an included file (e.g., a common setup sequence) and use their results, without displaying the embedded file's content.
  - Example: `::md[./setup_requests.md]{hidden}`

#### `::input[{name}]` Directive Options

The `::input` directive is used to declare expected input variables

- **Variable Name:** The first argument (required) is the name of the variable
  - Example: `::input[myVariable]` will define `input.myVariable`
- `required`: If present it will require that the variable is provided
- `default={value}`: Defines the default value if no value has been provided
- `format=string|number|bool|json|date`: If provided the value will be parsed using the specified format
- \`\`

## Command-Line Interface (CLI)

The `httpmd` tool provides the following commands:

### `httpmd dev <source_file.md>`

Processes the `<source_file.md>`, executes all HTTP requests, resolves templates, and prints the resulting markdown to the **terminal (stdout)**.

- **Purpose:** Useful for live development and quick previews.
- **Options:**
  - `--watch`: Monitors the `<source_file.md>` (and any embedded files) for changes. On detection of a change, it automatically re-processes and re-renders the output to the terminal.
  - `-i <key=value>`, `--input <key=value>`: Defines an input variable for templating (see [Using Input Variables](https://www.google.com/search?q=%23using-input-variables)). Can be specified multiple times for multiple variables.

**Example:**

```shell
httpmd dev api_tests.md --watch -i host=localhost:3000
```

### `httpmd build <source_file.md> <output_file.md>`

Processes the `<source_file.md>`, executes all HTTP requests, resolves templates, and saves the resulting markdown to `<output_file.md>`.

- **Purpose:** Generates a static, shareable markdown file with all dynamic content resolved. Ideal for version control, static site generation, or distributing documentation.
- **Options:**
  - `--watch`: Monitors the `<source_file.md>` (and any embedded files) for changes. On detection of a change, it automatically re-processes and re-builds the `<output_file.md>`.
  - `-i <key=value>`, `--input <key=value>`: Defines an input variable for templating.

**Example:**

```shell
httpmd build official_api_docs.md public/api_docs_v1.md -i version=v1.0
```
