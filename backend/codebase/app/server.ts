import express, { NextFunction } from 'express';
import next from 'next';

import v1Router from '@/backend/routes/v1routes';
import logger from '@/backend/logger';
import 'dotenv/config'
import responseTime from 'response-time';
import { redeliverFailedWebhookInvocations } from './helpers/github';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = Number(process.env.PORT) || 3001;
const FRONTEND_URL:string = process.env.NODE_ENV === 'production' ? 'https://hasti.app' : '*'

app.prepare().then(async () => {
    const server = express();
    // Set corse
    server.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", FRONTEND_URL);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      next();
    });

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use((req, _res, next) => {
          const start = Date.now();
          if(dev){
            _res.on('finish', () => {
              if(req.method === 'OPTIONS') return;
              const duration = Date.now() - start;
              logger.info( req.path ,{ label: `${req.method}][${duration}ms` });
            });
          }
        next();
      
        })
    server.use('/api/v1', v1Router);

    server.use('/health', (_req, res) => {
      
        res.status(200).send('⌂ :)');
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, () => {
      redeliverFailedWebhookInvocations()
        logger.info(`Server ready on port ${port}`, {
          label: 'Server',
        });
      });

}).catch((error) => {
  logger.error(`Error starting server: ${(error as Error).message} - ${(error as Error).stack}`)
  process.exit(1);
  });
