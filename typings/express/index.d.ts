import { KitesInstance } from '@kites/engine';

declare module 'express' {
    interface Request {
        kites: KitesInstance;
        wantsJSON: boolean;
        isSocket: boolean;
        explicitlyAcceptsHTML: boolean;
        options?: any;
        authSchema?: string;
        _errorInResView?: any;
        param(name: string, defaultValue?: any): any;
    }

    interface Response {
        ok(data: any): Express.Response;
        error(err: Error | string | any): Express.Response;
        serverError(err: any): Express.Response;
        notFound(err: any): Express.Response;
        badRequest(err: any): Express.Response;
        forbidden(err: any): Express.Response;
        view(): Express.Response;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        kites: KitesInstance;
        wantsJSON: boolean;
        isSocket: boolean;
        explicitlyAcceptsHTML?: boolean;
        options?: any;
        authSchema?: string;
        _errorInResView?: any;
        param(name: string, defaultValue?: any): any;
    }

    interface Response {
        ok(data: any): Express.Response | undefined;
        error(err: Error | string | any): Express.Response;
        serverError(err: any): Express.Response;
        notFound(err: any): Express.Response;
        badRequest(err: any): Express.Response;
        forbidden(err: any): Express.Response;
        view(): Express.Response;
    }
}

export {};
