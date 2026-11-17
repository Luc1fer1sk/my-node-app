const { server } = require('./task1');

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server zapushchen na portu ${PORT}: http://localhost:${PORT}`);
});
