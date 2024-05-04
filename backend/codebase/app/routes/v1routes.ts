import { Router } from 'express';

// Import routers
import authRouter from '@/backend/routes/auth';
import notificationsRouter from '@/backend/routes/notifications';

import projectsRouter from '@/backend/routes/projects';
import reposRouter from '@/backend/routes/repos';
import tagsRouter from '@/backend/routes/tags';
import userRouter from '@/backend/routes/user';
import webhookRouter from '@/backend/routes/webhook';

import { isAuthenticated } from '@/backend/helpers/auth';


const v1Router = Router();

// v1Router.use('/user', isAuthenticated(Permission.ADMIN), userRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/projects', projectsRouter);
v1Router.use('/repos', reposRouter);
v1Router.use('/tags', tagsRouter);
v1Router.use('/user', userRouter);

v1Router.use('/webhooks', webhookRouter);

export default v1Router;
