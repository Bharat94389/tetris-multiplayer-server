export class IocContainer {
    private services = {};

    register(serviceName: number, callback) {
        Object.defineProperty(this, serviceName, {
            get: () => {
                if (!Object.hasOwn(this.services, serviceName)) {
                    this.services[serviceName] = callback(this);
                }
                return this.services[serviceName];
            },
            enumerable: true,
            configurable: true
        });
    }
}
