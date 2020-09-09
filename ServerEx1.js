var appMaker = require("express");
var app = appMaker();

app.use(function(req, res) {
   console.log("Calling handler");
   res.status(200).end('Hello World\n');
});

// REPLACE 3000 WITH YOUR PORT!
app.listen(3000);
