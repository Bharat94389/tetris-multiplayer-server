import { AppError } from '../../utils';

class BaseModel {
    data: any;

    constructor(data: any) {
        this.data = data;
    }

    validate(): void {
        throw new AppError({ message: 'Validate is not implemented' });
    }

    static async findOne(filter: any, options?: any): Promise<any> {
        throw new AppError({ message: 'FindOne is not implemented' });
    }

    static find(filter: any, options?: any): any {
        throw new AppError({ message: 'FindOne is not implemented' });
    }

    async create(): Promise<boolean> {
        throw new AppError({ message: 'Create is not implemented' });
    }

    async update(filter: any, data: any): Promise<void> {
        throw new AppError({ message: 'Update is not implemented' });
    }

    async delete(): Promise<void> {
        throw new AppError({ message: 'Delete is not implemented' });
    }
}

export default BaseModel;
