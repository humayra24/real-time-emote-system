# Server A

This directory is for the code and documentation of the _server A_. A starter Dockerfile has been added, it has some comments to get you started.

Server A acts as a consumer for at least the _aggregated-emote-data_ topic. You may want to consume also the _raw-emote-data_ topic. Consume the messages and publish those to each WebSocket client.

To get started you should run `npm init` in this directory to initialize the Node project. This will create a `package.json`-file, which is used to define the project's attributes, dependencies etc. You should next create the index.js file.
