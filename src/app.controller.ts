import { Request, Response, Router } from 'express';
import AppService from './app.service';

export default class AppController {
    public readonly router: Router;
    private readonly appService: AppService;

    constructor(appService: AppService) {
        this.router = Router();
        this.appService = appService;
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get('/health', this.healthCheck);
        this.router.get('/cpu-intensive', this.cpuIntensive);
        this.router.get('/memory-intensive', this.memoryIntensive);
        this.router.get('/io-delay', this.ioDelay);
        this.router.post('/echo', this.echo);
        this.router.get('/payload/:size', this.variablePayload);
    }

    private healthCheck = (_req: Request, res: Response): void => {
        const result = this.appService.healthCheck();
        res.json(result);
    };

    private cpuIntensive = (req: Request, res: Response): void => {
        const n = parseInt(req.query['n'] as string) || 35;
        const result = this.appService.cpuIntensive(n);
        res.json(result);
    };

    private memoryIntensive = (req: Request, res: Response): void => {
        const size = parseInt(req.query['size'] as string) || 100000;
        const result = this.appService.memoryIntensive(size);
        res.json(result);
    };

    private ioDelay = async (req: Request, res: Response): Promise<void> => {
        const delay = parseInt(req.query['delay'] as string) || 100;
        const result = await this.appService.ioDelay(delay);
        res.json(result);
    };

    private echo = (req: Request, res: Response): void => {
        const result = this.appService.echo(req.body, req.headers['content-type'], req.headers['user-agent']);
        res.json(result);
    };

    private variablePayload = (req: Request, res: Response): void => {
        const size = req.params['size'] as string;
        const result = this.appService.variablePayload(size);
        res.json(result);
    };
}
