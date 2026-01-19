import { AppDataSource } from '../src/infrastructure/database/data-source';
import { ExpoPushToken } from '../src/modules/expo-push-token/domain/entities/expo-push-token.entity';

const USER_ID = parseInt(process.argv[2] || '16', 10);

async function deleteExpoPushTokens() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    const repository = AppDataSource.getRepository(ExpoPushToken);
    const result = await repository.delete({ userId: USER_ID });

    console.log('Delete result:', result);
    if (result.affected && result.affected > 0) {
      console.log(
        `Successfully deleted ${result.affected} ExpoPushToken(s) for userId: ${USER_ID}`,
      );
    } else {
      console.log(`No ExpoPushToken found for userId: ${USER_ID}`);
    }
  } catch (err) {
    console.error('Error during deletion:', err);
  } finally {
    await AppDataSource.destroy();
  }
}

deleteExpoPushTokens();
