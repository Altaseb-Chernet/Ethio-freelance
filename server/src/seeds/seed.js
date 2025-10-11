// server/src/seeds/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Contract = require('../models/Contract');
const Message = require('../models/Message');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-freelance');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Bid.deleteMany({});
    await Contract.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = new User({
      email: 'admin@marketplace.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        firstName: 'Marketplace',
        lastName: 'Admin'
      },
      isVerified: true
    });
    await admin.save();
    console.log('Admin user created');

    // Create client users
    const client1 = new User({
      email: 'client1@example.com',
      password: 'client123',
      role: 'client',
      profile: {
        firstName: 'John',
        lastName: 'Business',
        bio: 'Entrepreneur looking for talented developers for my projects.'
      },
      isVerified: true
    });

    const client2 = new User({
      email: 'client2@example.com',
      password: 'client123',
      role: 'client',
      profile: {
        firstName: 'Sarah',
        lastName: 'Startup',
        bio: 'Startup founder needing various technical expertise.'
      },
      isVerified: true
    });

    await client1.save();
    await client2.save();
    console.log('Client users created');

    // Create freelancer users with different skills
    const freelancer1 = new User({
      email: 'dev1@example.com',
      password: 'freelancer123',
      role: 'freelancer',
      profile: {
        firstName: 'Mike',
        lastName: 'Developer',
        bio: 'Full-stack developer specializing in React and Node.js with 5 years of experience.',
        skills: ['react', 'nodejs', 'javascript', 'mongodb', 'express'],
        hourlyRate: 45,
        portfolio: [
          {
            title: 'E-commerce Platform',
            description: 'Built a full-stack e-commerce solution',
            url: 'https://github.com/mike/example1'
          }
        ]
      },
      isVerified: true
    });

    const freelancer2 = new User({
      email: 'pythondev@example.com',
      password: 'freelancer123',
      role: 'freelancer',
      profile: {
        firstName: 'Anna',
        lastName: 'DataScientist',
        bio: 'Python developer and ML engineer with expertise in data analysis and machine learning.',
        skills: ['python', 'machine learning', 'data analysis', 'pandas', 'scikit-learn'],
        hourlyRate: 60,
        portfolio: [
          {
            title: 'ML Prediction Model',
            description: 'Developed a predictive model for customer behavior',
            url: 'https://github.com/anna/example2'
          }
        ]
      },
      isVerified: true
    });

    const freelancer3 = new User({
      email: 'designer@example.com',
      password: 'freelancer123',
      role: 'freelancer',
      profile: {
        firstName: 'Chris',
        lastName: 'Designer',
        bio: 'Creative graphic designer with expertise in UI/UX and branding.',
        skills: ['graphic design', 'photoshop', 'illustrator', 'ui/ux', 'figma'],
        hourlyRate: 35,
        portfolio: [
          {
            title: 'Brand Identity Package',
            description: 'Complete brand identity for tech startup',
            url: 'https://behance.net/chris/example3'
          }
        ]
      },
      isVerified: true
    });

    const freelancer4 = new User({
      email: 'mobile@example.com',
      password: 'freelancer123',
      role: 'freelancer',
      profile: {
        firstName: 'David',
        lastName: 'MobileDev',
        bio: 'Mobile app developer specializing in Flutter and React Native.',
        skills: ['mobile development', 'flutter', 'react native', 'dart', 'firebase'],
        hourlyRate: 50,
        portfolio: [
          {
            title: 'Fitness Tracking App',
            description: 'Cross-platform fitness application',
            url: 'https://github.com/david/example4'
          }
        ]
      },
      isVerified: true
    });

    await freelancer1.save();
    await freelancer2.save();
    await freelancer3.save();
    await freelancer4.save();
    console.log('Freelancer users created');

    // Create jobs
    const jobs = [
      {
        title: 'Build React E-commerce Website',
        description: 'Need a full-stack developer to build an e-commerce website using React and Node.js. The site should include user authentication, product catalog, shopping cart, and payment integration.',
        clientId: client1._id,
        skillsRequired: ['react', 'nodejs', 'mongodb', 'javascript'],
        budget: {
          type: 'fixed',
          fixed: 2500
        },
        duration: '2-4 weeks'
      },
      {
        title: 'Python Data Analysis Script',
        description: 'Looking for a Python developer to create data analysis scripts for processing large datasets. Experience with pandas and numpy required.',
        clientId: client1._id,
        skillsRequired: ['python', 'data analysis', 'pandas', 'numpy'],
        budget: {
          type: 'hourly',
          min: 30,
          max: 50
        },
        duration: '1-2 weeks'
      },
      {
        title: 'Mobile App UI/UX Design',
        description: 'Seeking a talented UI/UX designer to create wireframes and design mockups for a new mobile application. Must have experience with Figma and modern design principles.',
        clientId: client2._id,
        skillsRequired: ['ui/ux', 'figma', 'graphic design'],
        budget: {
          type: 'fixed',
          fixed: 1200
        },
        duration: '1-2 weeks'
      },
      {
        title: 'Flutter Mobile App Development',
        description: 'Need a Flutter developer to build a cross-platform mobile app for both iOS and Android. The app will include user profiles, real-time chat, and payment features.',
        clientId: client2._id,
        skillsRequired: ['flutter', 'mobile development', 'firebase'],
        budget: {
          type: 'hourly',
          min: 40,
          max: 60
        },
        duration: '1-3 months'
      },
      {
        title: 'MERN Stack Social Media App',
        description: 'Looking for a full-stack developer to build a social media application using the MERN stack. Features should include posts, comments, likes, and real-time notifications.',
        clientId: client1._id,
        skillsRequired: ['react', 'nodejs', 'mongodb', 'express'],
        budget: {
          type: 'fixed',
          fixed: 4000
        },
        duration: '2-4 weeks'
      },
      {
        title: 'Machine Learning Model for Sales Prediction',
        description: 'Seeking an ML engineer to develop a predictive model for sales forecasting. Experience with scikit-learn and time series analysis preferred.',
        clientId: client2._id,
        skillsRequired: ['machine learning', 'python', 'scikit-learn'],
        budget: {
          type: 'fixed',
          fixed: 3000
        },
        duration: '2-4 weeks'
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log('Jobs created');

    // Create bids
    const bids = [
      {
        jobId: createdJobs[0]._id,
        freelancerId: freelancer1._id,
        proposal: 'I have extensive experience building e-commerce platforms with React and Node.js. I can deliver a fully functional website within your timeline.',
        price: 2300,
        estimatedTime: { value: 3, unit: 'weeks' }
      },
      {
        jobId: createdJobs[0]._id,
        freelancerId: freelancer4._id,
        proposal: 'As a full-stack developer, I can build your e-commerce site with modern technologies and ensure responsive design.',
        price: 2100,
        estimatedTime: { value: 2, unit: 'weeks' }
      },
      {
        jobId: createdJobs[1]._id,
        freelancerId: freelancer2._id,
        proposal: 'I specialize in data analysis with Python and have worked on similar projects. I can process your datasets efficiently.',
        price: 35,
        estimatedTime: { value: 1, unit: 'weeks' }
      },
      {
        jobId: createdJobs[2]._id,
        freelancerId: freelancer3._id,
        proposal: 'I can create beautiful and intuitive designs for your mobile app using Figma. My designs are user-centered and modern.',
        price: 1000,
        estimatedTime: { value: 1, unit: 'weeks' }
      },
      {
        jobId: createdJobs[3]._id,
        freelancerId: freelancer4._id,
        proposal: 'I have built several Flutter apps with similar features. I can develop your app with clean code and excellent performance.',
        price: 45,
        estimatedTime: { value: 2, unit: 'months' }
      },
      {
        jobId: createdJobs[4]._id,
        freelancerId: freelancer1._id,
        proposal: 'I have experience building social media apps with the MERN stack. I can implement all the requested features with real-time functionality.',
        price: 3800,
        estimatedTime: { value: 3, unit: 'weeks' }
      },
      {
        jobId: createdJobs[5]._id,
        freelancerId: freelancer2._id,
        proposal: 'I can develop an accurate sales prediction model using machine learning techniques. I have experience with similar forecasting projects.',
        price: 2800,
        estimatedTime: { value: 3, unit: 'weeks' }
      },
      {
        jobId: createdJobs[2]._id,
        freelancerId: freelancer1._id,
        proposal: 'While I\'m primarily a developer, I have strong UI/UX skills and can create functional designs for your app.',
        price: 800,
        estimatedTime: { value: 1, unit: 'weeks' }
      }
    ];

    await Bid.insertMany(bids);
    console.log('Bids created');

    // Create active contracts
    const contract1 = new Contract({
      jobId: createdJobs[0]._id,
      clientId: client1._id,
      freelancerId: freelancer1._id,
      bidId: bids[0]._id,
      terms: {
        price: 2300,
        estimatedTime: { value: 3, unit: 'weeks' }
      },
      status: 'active'
    });

    const contract2 = new Contract({
      jobId: createdJobs[2]._id,
      clientId: client2._id,
      freelancerId: freelancer3._id,
      bidId: bids[3]._id,
      terms: {
        price: 1000,
        estimatedTime: { value: 1, unit: 'weeks' }
      },
      status: 'active'
    });

    await contract1.save();
    await contract2.save();

    // Update jobs with selected freelancers
    await Job.findByIdAndUpdate(createdJobs[0]._id, {
      status: 'in-progress',
      selectedFreelancer: {
        freelancerId: freelancer1._id,
        bidId: bids[0]._id,
        acceptedAt: new Date()
      }
    });

    await Job.findByIdAndUpdate(createdJobs[2]._id, {
      status: 'in-progress',
      selectedFreelancer: {
        freelancerId: freelancer3._id,
        bidId: bids[3]._id,
        acceptedAt: new Date()
      }
    });

    console.log('Contracts created and jobs updated');

    // Create chat messages for active contracts
    const messages = [
      {
        contractId: contract1._id,
        senderId: client1._id,
        receiverId: freelancer1._id,
        content: 'Hi Mike, excited to work with you on the e-commerce project!'
      },
      {
        contractId: contract1._id,
        senderId: freelancer1._id,
        receiverId: client1._id,
        content: 'Hello John! Looking forward to building your e-commerce site. Do you have any specific design preferences?'
      },
      {
        contractId: contract1._id,
        senderId: client1._id,
        receiverId: freelancer1._id,
        content: 'I\'d like a modern, clean design. Something similar to modern e-commerce platforms.'
      },
      {
        contractId: contract2._id,
        senderId: client2._id,
        receiverId: freelancer3._id,
        content: 'Hi Chris, I need the mobile app designs by next Friday. Is that feasible?'
      },
      {
        contractId: contract2._id,
        senderId: freelancer3._id,
        receiverId: client2._id,
        content: 'Yes, Sarah! I can deliver the initial wireframes by Wednesday and final designs by Friday.'
      }
    ];

    await Message.insertMany(messages);
    console.log('Chat messages created');

    // Fund the escrow for active contracts
    await Job.findByIdAndUpdate(createdJobs[0]._id, {
      escrow: {
        funded: true,
        amount: 2300,
        released: false
      }
    });

    await Job.findByIdAndUpdate(createdJobs[2]._id, {
      escrow: {
        funded: true,
        amount: 1000,
        released: false
      }
    });

    console.log('Escrow funded for active contracts');

    console.log('Seed data completed successfully!');
    console.log('\n=== Test Accounts ===');
    console.log('Admin: admin@marketplace.com / admin123');
    console.log('Client 1: client1@example.com / client123');
    console.log('Client 2: client2@example.com / client123');
    console.log('Freelancer 1: dev1@example.com / freelancer123');
    console.log('Freelancer 2: pythondev@example.com / freelancer123');
    console.log('Freelancer 3: designer@example.com / freelancer123');
    console.log('Freelancer 4: mobile@example.com / freelancer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed data error:', error);
    process.exit(1);
  }
};

seedData();