# POST a new text fragment as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Hello`

HTTP/1.1 201
[Captures]
url: header "Location"

# GET the fragment using the captured URL as an authorized user
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8
[Asserts]
jsonpath "$.data" == "Hello"

# DELETE the fragment using the captured URL as an authorized user
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 500

# Try to GET the fragment again using the captured URL as an authorized user
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
jsonpath "$.error" == "Fragment not found"
