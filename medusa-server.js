const express = require("express");
const { GracefulShutdownServer } = require("medusa-core-utils");
const loaders = require("@medusajs/medusa/dist/loaders");

const start = async function({ port }) {
  const app = express();

  // Add health route
  app.get('/health', (req, res) => res.status(200).send('OK'));

  try {
    const { container } = await loaders.default({
      directory: process.cwd(),
      expressApp: app,
    });

    const configModule = container.resolve("configModule");
    const port_ = port ?? process.env.PORT ?? configModule.projectConfig.port ?? 8080;

    const server = GracefulShutdownServer.create(
      app.listen(port_, '0.0.0.0', (err) => {
        if (err) {
          return;
        }
        console.log(`Medusa server is ready on port: ${port_}!`);
      })
    );

    // Handle graceful shutdown
    const gracefulShutDown = () => {
      server
        .shutdown()
        .then(() => {
          console.log("Gracefully stopping the server.");
          process.exit(0);
        })
        .catch((e) => {
          console.error("Error received when shutting down the server.", e);
          process.exit(1);
        });
    };
    process.on("SIGTERM", gracefulShutDown);
    process.on("SIGINT", gracefulShutDown);

    return { app, port: port_ };
  } catch (err) {
    console.error("Error starting server", err);
    process.exit(1);
  }
};

if (require.main === module) {
  start({});
}

module.exports = start;