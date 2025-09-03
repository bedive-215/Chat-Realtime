import express from 'express';
import router from './routes/app.route.js';
import { PORT } from './helpers/env.helper.js';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});