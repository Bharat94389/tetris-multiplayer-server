type TAppErrorParams = {
    message: string;
    status?: number;
    args?: any;
    stack?: string;
};

interface IAppError extends Error {
    name: string;
    message: string;
    status?: number;
    args?: any;
}

export { IAppError, TAppErrorParams };
