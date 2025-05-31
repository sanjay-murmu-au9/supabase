import { User } from '../types/db.types';
import { UserRepository } from '../repositories/user.repository';
import { GenericService } from './generic.service';

export class UserService extends GenericService<User> {
  private userRepository: UserRepository;

  constructor() {
    const repository = new UserRepository();
    super(repository);
    this.userRepository = repository;
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}