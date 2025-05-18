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
