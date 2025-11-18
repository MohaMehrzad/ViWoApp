import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RewardsService } from '../src/rewards/rewards.service';

async function distributeDailyRewards() {
  console.log('🎁 ViWoApp Daily Reward Distribution\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const rewardsService = app.get(RewardsService);

  try {
    console.log('Starting distribution...');
    const result = await rewardsService.distributeDailyRewards();

    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log(`Distributed: ${result.distributed.toFixed(2)} VCN`);
      console.log(`Recipients: ${result.recipients} users`);
      console.log(`Average: ${result.averageReward.toFixed(2)} VCN per user`);
      if (result.topEarner) {
        console.log(`Top Earner: User ${result.topEarner.userId} (${result.topEarner.amount.toFixed(2)} VCN)`);
      }
    } else {
      console.log(`\n⚠️ ${result.message}`);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await app.close();
  }

  console.log('\n✅ Done!');
  process.exit(0);
}

distributeDailyRewards();

