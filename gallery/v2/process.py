with open("../index.html", "r") as file:
    content = file.read()

content = content.replace('="/', '="./')

with open("../index.html", "w") as file:
    file.write(content)
