# POST a new JSON fragment to http://localhost:8080 as an authorized user
POST http://localhost:8080/v1/fragments
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1
```json
{
  "service": "DynamoDB"
}
```
HTTP/1.1 201
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# GET the fragment info for the fragment just created
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" exists
jsonpath "$.fragment.type" == "application/json; charset=utf-8"
body contains "DynamoDB"

# POST a second Markdown fragment to http://localhost:8080 as the same authorized user
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown; charset=utf-8
[BasicAuth]
user1@email.com:password1


`DynamoDB is **great**.`

HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"


# GET the fragment info for the second fragment just created
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.fragment.id" exists
jsonpath "$.fragment.type" == "text/markdown; charset=utf-8"
jsonpath "$.fragment.data" == "DynamoDB is **great**."

# GET all of the fragments for the same authorized user without expanding them
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200


# DELETE the first fragment created
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# Try to GET the first fragment again using the URL captured above
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
[Asserts]
jsonpath "$.error" == "Fragment not found"

# GET all of the fragments for the same authorized user without expanding them a second time
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
# jsonpath "$.fragments" not includes "{{fragment1_id}}"
# jsonpath "$.fragments" includes "{{fragment2_id}}"
