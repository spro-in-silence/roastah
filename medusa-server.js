const express = require("express");
const { GracefulShutdownServer } = require("medusa-core-utils");
const loaders = require("@medusajs/medusa/dist/loaders");

const start = async function({ port }) {
  const app = express();

  try {
    const { container } = await loaders.default({
      directory: process.cwd(),
      expressApp: app,
    });

    const configModule = container.resolve("configModule");
    const port_ = port ?? configModule.projectConfig.port ?? 9000;

    const server = GracefulShutdownServer.create(
      app.listen(port_, (err) => {
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