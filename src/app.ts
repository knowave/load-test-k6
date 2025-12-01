import express, { Application } from 'express';
import AppController from './app.controller';
import AppService from './app.service';

export default class App {
    private readonly _app: Application;
    private readonly _port: number;

    constructor(port: number = 3000) {
        this._app = express();
        this._port = port;

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    public get app(): Application {
        return this._app;
    }

    public get port(): number {
        return this._port;
    }

    private initializeMiddlewares(): void {
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        const appService = new AppService();
        const appController = new AppController(appService);
        this._app.use('/api', appController.router);
    }

    private initializeErrorHandling(): void {
        // 에러 핸들링 미들웨어 등록
    }

    public listen(): void {
        this._app.listen(this._port, () => {
            console.log(`🚀 Server is running on port ${this._port}`);
        });
    }
}
