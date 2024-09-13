import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';


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

  const address = '0.0.0.0:50051';
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(`Failed to start gRPC server: ${err.message}`);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
    server.start();
  });
}
