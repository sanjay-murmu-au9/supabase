import { User } from '../types/db.types';
import { UserRepository } from '../repositories/user.repository';
import { GenericService } from './generic.service';

export class UserService extends GenericService<User> {
  constructor(private userRepository: UserRepository) {
    super(userRepository);
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }
}