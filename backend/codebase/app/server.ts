import express, { NextFunction } from 'express';
import next from 'next';

import v1Router from '@/backend/app/routes/v1routes';
import logger from '@/backend/app/logger';
import 'dotenv/config'

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = Number(process.env.PORT) || 3001;
const FRONTEND_URL:string = process.env.NODE_ENV === 'production' ? 'https://api.hasti.app' : 'http://localhost:3000'

app.prepare().then(async () => {
    const server = express();
    // Set corse
    server.use(function(req, res, next) {
      console.log('req.headers',  FRONTEND_URL)
      res.header("Access-Control-Allow-Origin", FRONTEND_URL);
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      next();
    });

    server.use(express.json());
    server.use(express.urlencoded({ extended: true }));
    server.use((req, _res, next) => {
        logger.info( 'Request: ',{ label: 'server.ts' });
        next();
        })
    server.use('/api/v1', v1Router);

    server.use('/health', (_req, res) => {
      
        res.status(200).send('OK');
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(port, () => {
        logger.info(`Server ready on port ${port}`, {
          label: 'Server',
        });
      });

}).catch((err) => {
    logger.error(err.stack);
    process.exit(1);
  });
