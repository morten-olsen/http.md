```http #createItem,json
POST https://httpbin.org/post
Content-Type: application/json

{"name": "My New Item"}
```

The new item ID is: {{response.body.json.name}}

Now, let's fetch the item using a (mocked) ID from the response:

```http id=fetchItem
GET https://httpbin.org/anything/{{responses.createItem.body.json.name}}
```

::response{#fetchItem}
