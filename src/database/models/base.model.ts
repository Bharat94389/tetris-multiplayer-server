import { AppError } from '../../utils';

class BaseModel {
    data?: any;

    constructor(data: any) {
        this.data = data;
    }

    static async findOne(filter: any, options?: any): Promise<any> {
        throw new AppError({ message: 'FindOne is not implemented' });
    }

    static async find(filter: any, options?: any): Promise<any> {
        throw new AppError({ message: 'FindOne is not implemented' });
    }

    async create(): Promise<any> {
        throw new AppError({ message: 'Create is not implemented' });
    }

    async update(filter: any, data: any) {
        throw new AppError({ message: 'Update is not implemented' });
    }

    async delete() {
        throw new AppError({ message: 'Delete is not implemented' });
    }
}

export default BaseModel;
