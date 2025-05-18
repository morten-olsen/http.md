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
