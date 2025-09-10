import express from 'express';
import router from './routes/app.route.js';
import { PORT } from './helpers/env.helper.js';
import { app, server } from './configs/socketioConf.js';
import { connectMongoDB } from './configs/mongooDBConf.js';


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectMongoDB();
});