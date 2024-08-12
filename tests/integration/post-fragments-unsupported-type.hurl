# post-fragments-unsupported-type.hurl
POST http://fragments-lb-776037001.us-east-1.elb.amazonaws.com/v1/fragments
Content-Type: text/cs
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

HTTP/1.1 415
[Asserts]
jsonpath "$.error" contains "Unsupported media type: text/cs"
