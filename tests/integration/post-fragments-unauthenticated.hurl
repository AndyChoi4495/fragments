# post-fragments-unauthenticated.hurl
POST http://localhost:8080/v1/fragments
Content-Type: application/json
`{"key":"value"}`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" contains "Unauthorized"
