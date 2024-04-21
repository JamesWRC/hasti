import express from 'express';
import next from 'next';
import logger from '@/backend/logger';


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = Number(process.env.PORT) || 3001;

app.prepare().then(async () => {
    const server = express();
    // server.use(express.json());
    // server.use(express.urlencoded({ extended: true }));

    server.use((req, _res, next) => {
        console.log('Request:', req.method, req.url);
        logger.debug(
            'Request:', req.method, req.url,
            { label: 'index' }
          );
        next();
        })
    
    // server.use('/api/v1', routes);

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
