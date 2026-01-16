import { AppDataSource } from '../src/infrastructure/database/data-source';
import { User } from '../src/modules/user/domain/entities/user.entity';

async function deleteUser() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.delete({ email: 'jipkim2@gmail.com' });

    console.log('Delete result:', result);
    if (result.affected && result.affected > 0) {
      console.log('Successfully deleted user jipkim2@gmail.com');
    } else {
      console.log('User not found or already deleted');
    }
  } catch (err) {
    console.error('Error during Data Source initialization or deletion:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

deleteUser();
