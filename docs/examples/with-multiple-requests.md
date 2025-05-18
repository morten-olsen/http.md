# Document with Multiple Requests

First, create a resource:

```http #createUser,format=yaml
POST https://httpbin.org/post
Content-Type: application/json

username: alpha
```

Then, fetch a different resource:

```http #getItem
GET https://httpbin.org/get?item=123
```

Response from creating the user:
::response{#createUser}

Response from getting the item:
::response{#getItem}
