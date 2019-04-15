const express = require('express');
const app = express();
const path    = require("path");

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/../dist/real-chat-app/index.html'));
});

app.use(express.static(__dirname + '/../dist/real-chat-app'));

console.log(process.env.PORT);
app.listen(process.env.PORT, function () {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
