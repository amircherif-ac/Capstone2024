#/bin/sh

ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkRlcmVrQm91Y2hlciIsInVzZXJJRCI6MSwicm9sZUlEIjoyLCJpYXQiOjE2NzkxNjU0NzksImV4cCI6MTY3OTE3NjI3OX0.Jm7dwWQsgxUWnBTX1Rq0usZuDYD3aNMeBe8fbCE2i2w

# Run the vegeta load test
cat create_post_html | vegeta attack -rate 20 -insecure -duration 5s | vegeta report
