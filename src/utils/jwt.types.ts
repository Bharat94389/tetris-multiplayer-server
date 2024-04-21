type TPayload = {
    email: string;
    username: string;
};

interface IJWT {
    readonly secretKey: string;

    generate({ email, username }: TPayload): Promise<string>;
    verify(token: string): null | TPayload;
    parse(token: string): TPayload;
}

export { TPayload, IJWT };
