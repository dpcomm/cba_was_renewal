import { AppDataSource } from '../src/infrastructure/database/data-source';
import { User } from '../src/modules/user/domain/entities/user.entity';

async function checkUserPhone() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const userRepository = AppDataSource.getRepository(User);
    const targetEmail = 'jipkim2@gmail.com';
    const user = await userRepository.findOne({ where: { email: targetEmail }, select: ['phone'] });

    if (user) {
      console.log(`Phone number for ${targetEmail}: ${user.phone}`);
    } else {
      console.log(`User with email ${targetEmail} not found.`);
    }
  } catch (err) {
    console.error('Error during Data Source initialization or query:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

checkUserPhone();
