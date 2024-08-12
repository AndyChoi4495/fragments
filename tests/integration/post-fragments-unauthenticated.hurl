# post-fragments-unauthenticated.hurl
POST http://fragments-lb-776037001.us-east-1.elb.amazonaws.com/v1/fragments
Content-Type: application/json
`{"key":"value"}`

HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" contains "Unauthorized"
