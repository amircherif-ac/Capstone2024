from flask import Flask

app = Flask(__name__)
port = 5007


@app.get('/suggestion')
def login_get():
    return 'sugesstion array'


if __name__ == '__main__':
    app.run(debug=False, port=port)
