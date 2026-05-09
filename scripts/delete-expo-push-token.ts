import { AppDataSource } from '../src/infrastructure/database/data-source';
import { PushToken } from '../src/modules/push-token/domain/entities/push-token.entity';

const USER_ID = parseInt(process.argv[2] || '16', 10);

async function deleteExpoPushTokens() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const repository = AppDataSource.getRepository(PushToken);
    const result = await repository.delete({ userId: USER_ID });

    console.log('Delete result:', result);
    if (result.affected && result.affected > 0) {
      console.log(
        `Successfully deleted ${result.affected} PushToken(s) for userId: ${USER_ID}`,
      );
    } else {
      console.log(`No PushToken found for userId: ${USER_ID}`);
    }
  } catch (err) {
    console.error('Error during deletion:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

deleteExpoPushTokens();
