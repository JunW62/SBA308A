// At the top of the file
const originWhitelist = ["http://127.0.0.1:5500"]; // Add your domains here

// In the request handler
app.use((req, res, next) => {
  if (originWhitelist.indexOf(req.header("Origin")) !== -1) {
    next();
  } else {
    res.status(403).send("Origin not allowed");
  }
});
