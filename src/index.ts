import express from 'express';
import v1Router from './routes/index.js';

const app = express();
app.use(express.json());

app.use('/' , v1Router);
