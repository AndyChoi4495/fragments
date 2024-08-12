# post-fragments-json.hurl
POST http://fragments-lb-776037001.us-east-1.elb.amazonaws.com/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
`{"key":"value"}`

HTTP/1.1 201
[Captures]
url: header "Location"

# GET the fragment to confirm its content
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8


