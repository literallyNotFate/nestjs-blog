import { ObjectLiteral, Repository } from 'typeorm';

export type EntityConstructor<T> = {
  new (...args: any[]): T;
};

export type MockRepository<T extends ObjectLiteral> = {
  [P in keyof Repository<T>]?: jest.Mock;
};
