from flask import Flask, render_template

# Khoi tao Flask
app = Flask(__name__)

# Ham xu ly request
@app.route("/", methods=['GET'])
def home_page():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(host='localhost', debug=False)