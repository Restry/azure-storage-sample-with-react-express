const express = require('express');
const config = require('./config');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
// const fakeHMR = require('./fake-hmr');
const { BlobServiceClient, generateBlobSASQueryParameters,
  ContainerSASPermissions, StorageSharedKeyCredential,
  BlobSASPermissions } = require('@azure/storage-blob');
const { v1: uuid } = require('uuid');


const compiler = webpack(webpackConfig);

// const watching = compiler.watch({
//   // Example watchOptions
//   aggregateTimeout: 300,
//   poll: undefined
// }, (err, stats) => { // Stats Object
//   console.log(stats.toString({
//     chunks: false,  // Makes the build much quieter
//     colors: true    // Shows colors in the console
//   }))
//   if (stats.hasErrors()) {
//     console.log('didn\' t build')
//     return;
//   }
//   console.log('built');
//   fakeHMR.built();
// });

const app = express();
// fakeHMR.config({ app });
app.use(express.static('public'));

// require('./webpackRunner'); 

// Create the BlobServiceClient object which will be used to create a container client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const sharedKeyCredential = new StorageSharedKeyCredential('auction', process.env.AZURE_STORAGE_KEY)

const container = blobServiceClient.getContainerClient('imagecontainer');
container.createIfNotExists()


function getContainerSasUri(containerClient, sharedKeyCredential, storedPolicyName) {
  const sasOptions = {
    containerName: containerClient.containerName,
    permissions: ContainerSASPermissions.parse("racwd")
  };

  if (storedPolicyName == null) {
    sasOptions.startsOn = new Date();
    sasOptions.expiresOn = getDate();
  } else {
    sasOptions.identifier = storedPolicyName;
  }

  const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
  console.log(`SAS token for blob container is: ${sasToken}`);

  return `${containerClient.url}_filename_?${sasToken}`;
}
function getDate() {
    var date = new Date();
    date.setMinutes((date).getMinutes() + 3);
    return date;
}

app.get('/getsignature', function(req, res) {
  const generateSasUrlRes = getContainerSasUri(container, sharedKeyCredential);
  res.json({ url: generateSasUrlRes })
});

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <title>hi</title>
  </head>
  <body>
    <div id="app"/>
    <script src="/bundle.js" type="text/javascript"></script>
  </body>
</html>`)
});

app.listen(config.PORT, function() {
  console.log(`App currently running; navigate to localhost:${config.PORT} in a web browser.`);
});
