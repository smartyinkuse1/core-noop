import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import * as fs from 'fs'


interface GenericMatch {
    [key: string]: string | number | Date | any;
}

// Define paths and load proto files
const PROTO_PATH = path.join(__dirname, './protos/product.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(packageDefinition).product as any;

const serverCert = fs.readFileSync('./certs/server.crt');
const serverKey = fs.readFileSync('./certs/server.key');
const credentials = grpc.ServerCredentials.createSsl(null, [
  {
    cert_chain: serverCert,
    private_key: serverKey,
  },
]);

// Mock product database
const products: GenericMatch = {
  '1': { id: '1', name: 'Product 1', price: 99.99 },
  '2': { id: '2', name: 'Product 2', price: 149.99 },
};

// Define the getProduct function
function getProduct(
  call: grpc.ServerUnaryCall<{ id: string }, { id: string; name: string; price: number }>,
  callback: grpc.sendUnaryData<{ id: string; name: string; price: number }>
): void {
  const productId = call.request.id;
  const product = products[productId];
  if (product) {
    callback(null, product);
  } else {
    callback({
      code: grpc.status.NOT_FOUND,
      details: 'Product not found',
    });
  }
}

// Start the gRPC server
export function startGrpcServer(): void {
  const server = new grpc.Server();
  server.addService(productProto.ProductService.service, { GetProduct: getProduct });

  // grpc.ServerCredentials.createInsecure()
  const address = '0.0.0.0:50051';
  server.bindAsync(address,credentials, (err, port) => {
    if (err) {
      console.error(`Failed to start gRPC server: ${err.message}`);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
    server.start();
  });
}
