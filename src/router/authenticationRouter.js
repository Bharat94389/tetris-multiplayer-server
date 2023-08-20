const BaseRouter = require('./baseRouter');

class AuthenticationRouter extends BaseRouter {
    constructor({ authenticationController }) {
        super();

        this.authenticationController = authenticationController;

        this.getRoutes();
    }

    getRoutes() {
        this.openRouter.post('/login', this.tryCatch(this.login.bind(this)));
        this.openRouter.post('/signup', this.tryCatch(this.signup.bind(this)));
        this.closedRouter.get('/verify/:token', this.tryCatch(this.verify.bind(this)));
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
        const { token } = req.params;
        const result = await this.authenticationController.verify({ token });
        res.json(result);
    }
}

module.exports = AuthenticationRouter;
