```javascript run
input.test = "Hello World";
```

::input[test]

```http json
POST https://httpbin.org/post

{"input": "{{input.test}}"}

```

```javascript run,hidden
// Use chai's `expect`, `assert` or `should` to make assumptions
expect(response.body.json.input).to.equal("Hello World");
```
