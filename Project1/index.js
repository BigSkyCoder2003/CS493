const express = require('express');
const app = express();

app.use(express.json());

const port = 8080;

app.listen(port, () => {
console.log(`Server listening on port ${port}`)

});


app.get("/businesses", (req, res, next) =>{
res.status(200);
res.send("Hello world!");
});

app.get("/businesses/:name", (req, res, next) =>{
  res.status(200);
  res.send("Hello world!");
  });

  app.get("/messages/:id", (req, res) => {
    const message = messages.get(parseInt(req.params.id));
    if (!message) {
      return res.status(404).send("Message not found.\n");
    }
    res.status(200).send(message + "\n");
  });

app.post("/businesses", (req, res, next) =>{
  res.status(200);
  res.send("Hello world!");
  });
app.post("/input", (req, res) =>{
  console.log(req.body)
  });

