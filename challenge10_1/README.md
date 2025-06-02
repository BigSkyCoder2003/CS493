# Express Hello World with Docker

A simple Express.js Hello World application containerized with Docker.

## Running locally

```bash
npm install
npm start
```

The server will start on port 3000.

## Running with Docker

Build the Docker image:
```bash
docker build -t express-hello-world .
```

Run the container:
```bash
docker run -p 3000:3000 express-hello-world
```

Visit http://localhost:3000 to see the Hello World message.
