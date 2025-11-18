import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const hashedPassword = await bcrypt.hash('Test123!', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      username: 'alice',
      passwordHash: hashedPassword,
      displayName: 'Alice Johnson',
      bio: 'Content creator and crypto enthusiast',
      verificationTier: 'VERIFIED',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      username: 'bob',
      passwordHash: hashedPassword,
      displayName: 'Bob Smith',
      bio: 'Tech blogger and developer',
      verificationTier: 'PREMIUM',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      email: 'charlie@example.com',
      username: 'charlie',
      passwordHash: hashedPassword,
      displayName: 'Charlie Brown',
      bio: 'Just exploring ViWoApp',
      verificationTier: 'BASIC',
    },
  });

  console.log('✅ Created test users');

  // Initialize VCoin balances
  await prisma.vCoinBalance.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      availableBalance: new Decimal(1000),
      stakedBalance: new Decimal(0),
      earnedTotal: new Decimal(1000),
      spentTotal: new Decimal(0),
    },
  });

  await prisma.vCoinBalance.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      availableBalance: new Decimal(500),
      stakedBalance: new Decimal(500),
      earnedTotal: new Decimal(1000),
      spentTotal: new Decimal(0),
    },
  });

  await prisma.vCoinBalance.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      availableBalance: new Decimal(100),
      stakedBalance: new Decimal(0),
      earnedTotal: new Decimal(100),
      spentTotal: new Decimal(0),
    },
  });

  console.log('✅ Created VCoin balances');

  // Helper arrays for generating varied content
  const users = [user1, user2, user3];
  const postContents = [
    'Just joined ViWoApp! Excited to earn VCoin through quality content 🚀',
    'The token economy here is revolutionary! Love how quality content gets rewarded.',
    'Learning about blockchain and DeFi. Any resources to share?',
    'Beautiful sunset from my balcony 🌅 #nature #photography',
    'Just deployed my first smart contract on testnet! 🎉 #blockchain #ethereum',
    'Coffee and code ☕️👨‍💻 Best combination ever!',
    'Excited to announce I\'ve earned over 1000 VCN this month! 💪',
    'Web3 is not just about technology, it\'s about reshaping how we interact online 🧵',
    'My workspace setup 2024 edition 🖥️✨',
    'Just staked 500 VCN for 90 days! Excited to earn passive rewards 🚀',
    'The future is decentralized 🌐',
    'Learning something new every day on ViWoApp. This community is amazing! 💙',
    'Mountain hiking this weekend 🏔️ Nature recharges my creativity!',
    'Pro tip: Always validate user input, even in Web3 applications. Security first! 🔐',
    'Just reached 100 followers! Thank you all for the support 🙏',
    'Crypto market analysis: What to expect in the coming weeks 📊',
    'Building the future of social media, one block at a time ⛓️',
    'Morning coffee thoughts: Why decentralization matters ☕',
    'Just published my first NFT collection! Check it out 🎨',
    'DeFi tutorial coming soon! Stay tuned 📺',
    'Amazing community meetup today! Thanks everyone 🤝',
    'Code review best practices for blockchain developers 👨‍💻',
    'Sunset vibes and crypto gains 🌅💰',
    'New week, new opportunities in Web3 🚀',
    'Smart contracts are the future of agreements 📝',
    'Just hit a new milestone! 🎯',
    'The power of decentralized governance 🗳️',
    'Building in public, learning in public 📚',
    'Crypto winter? More like building season ❄️➡️🔥',
    'Zero-knowledge proofs explained simply 🔐',
  ];

  const imageUrls = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1461988320302-91bde64fc8e4',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0',
    'https://images.unsplash.com/photo-1639322537228-f710d846310a',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
    'https://images.unsplash.com/photo-1621761191319-c6fb62004040',
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159',
    'https://images.unsplash.com/photo-1639762681057-408e52192e55',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113',
  ];

  // Create 50 posts
  const posts: any[] = [];
  for (let i = 0; i < 50; i++) {
    const user = users[i % users.length];
    const content = postContents[i % postContents.length] + ` [${i + 1}]`;
    const hasImage = i % 3 === 0; // Every 3rd post has an image
    const imageUrl = hasImage ? imageUrls[i % imageUrls.length] : null;
    
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        mediaType: hasImage ? 'image' : null,
        mediaUrl: imageUrl,
        mediaThumbnail: imageUrl ? `${imageUrl}?w=400` : null,
        likesCount: Math.floor(Math.random() * 150) + 10,
        sharesCount: Math.floor(Math.random() * 50) + 1,
        commentsCount: Math.floor(Math.random() * 30) + 1,
        viewsCount: Math.floor(Math.random() * 1000) + 100,
        createdAt: new Date(Date.now() - (i * 2 * 60 * 60 * 1000)), // Spread over time
      },
    });
    posts.push(post);
  }

  console.log('✅ Created sample posts (50 total)');

  // Create 50 sample shorts
  const shortTitles = [
    'Quick DeFi Tutorial 🚀',
    'Web3 in 60 seconds',
    'My coding setup tour',
    'First day on ViWoApp!',
    'Smart contract deployment',
    'Crypto news daily',
    'Learning to code',
    'DeFi explained simply',
    'NFT minting guide',
    'Blockchain basics',
    'Solidity tips & tricks',
    'My crypto portfolio',
    'Web3 career advice',
    'DAO governance explained',
    'Layer 2 solutions',
    'Yield farming guide',
    'Crypto tax tips',
    'Security best practices',
    'dApp development',
    'Token economics 101',
  ];

  // Using WORKING video URLs - these are verified to work with React Native
  // Pexels Videos API - free, no auth required, CORS enabled
  const videoUrls = [
    'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
    'https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4',
    'https://videos.pexels.com/video-files/2792157/2792157-uhd_2560_1440_30fps.mp4',
    'https://videos.pexels.com/video-files/4100261/4100261-uhd_2560_1440_25fps.mp4',
    'https://videos.pexels.com/video-files/6563093/6563093-uhd_2560_1440_24fps.mp4',
    'https://videos.pexels.com/video-files/5377684/5377684-uhd_2560_1440_25fps.mp4',
    'https://videos.pexels.com/video-files/3843433/3843433-uhd_2560_1440_30fps.mp4',
    'https://videos.pexels.com/video-files/4621235/4621235-uhd_2560_1440_24fps.mp4',
  ];

  const shorts: any[] = [];
  for (let i = 0; i < 50; i++) {
    const user = users[i % users.length];
    const title = shortTitles[i % shortTitles.length] + ` #${i + 1}`;
    const videoUrl = videoUrls[i % videoUrls.length];
    const thumbnailUrl = imageUrls[i % imageUrls.length];
    
    const short = await prisma.short.create({
      data: {
        userId: user.id,
        title,
        videoUrl,
        thumbnailUrl: `${thumbnailUrl}?w=400`,
        duration: Math.floor(Math.random() * 30) + 30, // 30-60 seconds
        viewsCount: Math.floor(Math.random() * 5000) + 500,
        likesCount: Math.floor(Math.random() * 800) + 50,
        createdAt: new Date(Date.now() - (i * 90 * 60 * 1000)), // Spread over time
      },
    });
    shorts.push(short);
  }

  console.log('✅ Created sample shorts (50 total)');

  // Create comments on some posts
  const commentTexts = [
    'Great post! 👍',
    'This is really helpful, thanks for sharing!',
    'Interesting perspective 🤔',
    'Love this content! 💙',
    'Can you share more details?',
    'Totally agree with this!',
    'Amazing work! 🎉',
    'Keep it up! 🚀',
    'This deserves more attention',
    'Well explained! 👏',
  ];

  for (let i = 0; i < 30; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const user = users[i % users.length];
    const commentText = commentTexts[i % commentTexts.length];
    
    await prisma.comment.create({
      data: {
        userId: user.id,
        postId: post.id,
        content: commentText,
      },
    });
  }

  console.log('✅ Created sample comments (30 total)');

  // Create follows
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: user3.id,
      followingId: user2.id,
    },
  });

  console.log('✅ Created follow relationships');

  // Create post interactions
  for (let i = 0; i < 20; i++) {
    const post = posts[Math.floor(Math.random() * posts.length)];
    const user = users[i % users.length];
    const interactionType = ['like', 'share', 'repost'][i % 3];
    
    try {
      await prisma.postInteraction.create({
        data: {
          userId: user.id,
          postId: post.id,
          interactionType,
          vcoinEarned: new Decimal(interactionType === 'like' ? 1 : interactionType === 'share' ? 2 : 3),
        },
      });
    } catch (e) {
      // Skip if interaction already exists (unique constraint)
    }
  }

  console.log('✅ Created post interactions');

  // Create content quality scores for first 10 posts
  for (let i = 0; i < 10; i++) {
    await prisma.contentQualityScore.create({
      data: {
        postId: posts[i].id,
        engagementRate: new Decimal((Math.random() * 0.3).toFixed(4)),
        retentionScore: new Decimal((Math.random() * 0.5 + 0.5).toFixed(2)),
        viralityScore: new Decimal((Math.random() * 1).toFixed(2)),
        commentQuality: new Decimal((Math.random() * 0.5 + 0.5).toFixed(2)),
        overallScore: new Decimal((Math.random() * 0.5 + 0.5).toFixed(2)),
        multiplier: new Decimal((Math.random() * 4 + 1).toFixed(2)),
      },
    });
  }

  console.log('✅ Created content quality scores');

  // Create user reputation scores
  await prisma.userReputationScore.create({
    data: {
      userId: user1.id,
      accountAgeScore: new Decimal(1.2),
      historicalQualityScore: new Decimal(1.5),
      verificationScore: new Decimal(1.4),
      communityStandingScore: new Decimal(1.3),
      overallReputation: new Decimal(1.6),
    },
  });

  await prisma.userReputationScore.create({
    data: {
      userId: user2.id,
      accountAgeScore: new Decimal(1.5),
      historicalQualityScore: new Decimal(1.8),
      verificationScore: new Decimal(1.8),
      communityStandingScore: new Decimal(1.6),
      overallReputation: new Decimal(2.2),
    },
  });

  await prisma.userReputationScore.create({
    data: {
      userId: user3.id,
      accountAgeScore: new Decimal(1.0),
      historicalQualityScore: new Decimal(1.0),
      verificationScore: new Decimal(1.0),
      communityStandingScore: new Decimal(1.0),
      overallReputation: new Decimal(1.0),
    },
  });

  console.log('✅ Created user reputation scores');

  // Create a stake for user2
  await prisma.vCoinStake.create({
    data: {
      userId: user2.id,
      amount: new Decimal(500),
      featureType: 'CONTENT_CREATOR_PRO',
      lockPeriodDays: 90,
      unlockDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      apy: new Decimal(5.0),
    },
  });

  console.log('✅ Created stake');

  // Create VCoin transactions
  await prisma.vCoinTransaction.create({
    data: {
      userId: user1.id,
      amount: new Decimal(50),
      type: 'earn',
      source: 'DAILY_REWARD',
      status: 'completed',
    },
  });

  await prisma.vCoinTransaction.create({
    data: {
      userId: user2.id,
      amount: new Decimal(100),
      type: 'earn',
      source: 'DAILY_REWARD',
      status: 'completed',
    },
  });

  console.log('✅ Created VCoin transactions');

  console.log('🎉 Seeding completed successfully!');
  console.log('\nTest Credentials:');
  console.log('Email: alice@example.com | Password: Test123!');
  console.log('Email: bob@example.com   | Password: Test123!');
  console.log('Email: charlie@example.com | Password: Test123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

