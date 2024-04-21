type TLoginParams = {
    email: string;
    password: string;
};

type TSignupParams = {
    username: string;
    email: string;
    password: string;
};

interface IAuthenticationController {
    login(param: TLoginParams): Promise<{ token: string } | null>;
    signup(param: TSignupParams): Promise<{ token: string } | null>;
}

export { TLoginParams, TSignupParams, IAuthenticationController };
