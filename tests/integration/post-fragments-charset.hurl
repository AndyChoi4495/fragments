# post-fragments-charset.hurl
POST http://fragments-lb-776037001.us-east-1.elb.amazonaws.com/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Hello, this is a text fragment with charset!`

HTTP/1.1 201
[Captures]
url: header "Location"

# GET the fragment to confirm its type and content
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
body contains "Hello, this is a text fragment with charset!"
