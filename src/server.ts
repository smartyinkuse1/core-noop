import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';
import { startGrpcServer } from './grpcServer';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome I love you');
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
  startGrpcServer();
});