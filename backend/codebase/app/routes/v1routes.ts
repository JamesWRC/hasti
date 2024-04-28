import { Router } from 'express';

// Import routers
import authRouter from '@/backend/app/routes/auth';
import notificationsRouter from '@/backend/app/routes/notifications';

import projectsRouter from '@/backend/app/routes/projects';
import reposRouter from '@/backend/app/routes/repos';
import tagsRouter from '@/backend/app/routes/tags';
import userRouter from '@/backend/app/routes/user';
import webhookRouter from '@/backend/app/routes/webhook';

import { isAuthenticated } from '@/backend/app/helpers/auth';


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
