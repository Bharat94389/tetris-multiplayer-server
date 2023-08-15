class AuthenticationRouter {
    constructor({ Router, authenticationController, tryCatch }) {
        this.Router = Router;
        this.authenticationController = authenticationController;
        this.tryCatch = tryCatch;
    }

    getRoutes() {
        const router = this.Router();

        router.post('/login', this.tryCatch(this.login.bind(this)));
        router.post('/signup', this.tryCatch(this.signup.bind(this)));
        router.get('/verify', this.tryCatch(this.verify.bind(this)));

        return router;
    }

    async login(req, res) {
        const { credentials } = req.body;
        const result = await this.authenticationController.login({ credentials });
        res.json(result);
    }

    async signup(req, res) {
        const { email, username, password } = req.body;
        const result = await this.authenticationController.signup({
            email,
            username,
            password,
        });
        res.json(result);
    }

    async verify(req, res) {
        const { token } = req.body;
        const result = await this.authenticationController.verify({ token });
        res.json(result);
    }
}

module.exports = AuthenticationRouter;
