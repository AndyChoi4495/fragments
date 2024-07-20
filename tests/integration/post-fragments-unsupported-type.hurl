# post-fragments-unsupported-type.hurl
POST http://localhost:8080/v1/fragments
Content-Type: text/cs
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

HTTP/1.1 415
[Asserts]
jsonpath "$.error" contains "Unsupported media type: text/cs"
