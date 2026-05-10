// FILE: server/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Comment.deleteMany({});
    await Task.deleteMany({});
    await Project.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // ──────────────────────────── USERS ────────────────────────────
    const admin = await User.create({
      name: 'Alex Johnson',
      email: 'admin@taskflow.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const manager = await User.create({
      name: 'Priya Sharma',
      email: 'priya@taskflow.com',
      password: 'Priya@123',
      role: 'admin',
    });

    const john = await User.create({
      name: 'John Williams',
      email: 'john@taskflow.com',
      password: 'John@123',
      role: 'member',
    });

    const sara = await User.create({
      name: 'Sara Martinez',
      email: 'sara@taskflow.com',
      password: 'Sara@123',
      role: 'member',
    });

    const mike = await User.create({
      name: 'Mike Chen',
      email: 'mike@taskflow.com',
      password: 'Mike@123',
      role: 'member',
    });

    const emma = await User.create({
      name: 'Emma Davis',
      email: 'emma@taskflow.com',
      password: 'Emma@123',
      role: 'member',
    });

    const raj = await User.create({
      name: 'Raj Patel',
      email: 'raj@taskflow.com',
      password: 'Raje@123',
      role: 'member',
    });

    const lisa = await User.create({
      name: 'Lisa Thompson',
      email: 'lisa@taskflow.com',
      password: 'Lisa@123',
      role: 'member',
    });

    console.log('Users created: 8');

    // helper: days from now
    const d = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    // ──────────────────────────── PROJECTS ────────────────────────────
    const p1 = await Project.create({
      title: 'E-Commerce Platform Redesign',
      description:
        'Complete overhaul of the e-commerce platform with modern UI/UX, improved checkout flow, mobile-first responsive design, and performance optimizations targeting a 40% conversion increase.',
      status: 'active',
      dueDate: d(30),
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: john._id, role: 'member' },
        { user: sara._id, role: 'member' },
        { user: emma._id, role: 'member' },
      ],
    });

    const p2 = await Project.create({
      title: 'Mobile App MVP – React Native',
      description:
        'Build the minimum viable product for the cross-platform mobile application targeting iOS and Android using React Native, including push notifications and offline support.',
      status: 'active',
      dueDate: d(45),
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: mike._id, role: 'member' },
        { user: raj._id, role: 'member' },
      ],
    });

    const p3 = await Project.create({
      title: 'Internal HR Portal',
      description:
        'Design and develop an internal HR management portal for employee onboarding, leave management, payroll integration, and performance reviews.',
      status: 'active',
      dueDate: d(60),
      owner: manager._id,
      members: [
        { user: manager._id, role: 'admin' },
        { user: lisa._id, role: 'member' },
        { user: emma._id, role: 'member' },
        { user: john._id, role: 'member' },
      ],
    });

    const p4 = await Project.create({
      title: 'DevOps Infrastructure Migration',
      description:
        'Migrate existing monolithic infrastructure to Kubernetes-based microservices architecture on AWS, including CI/CD pipelines, monitoring, and auto-scaling.',
      status: 'on-hold',
      dueDate: d(90),
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: raj._id, role: 'member' },
        { user: mike._id, role: 'member' },
      ],
    });

    const p5 = await Project.create({
      title: 'Marketing Website Refresh',
      description:
        'Refresh the company marketing website with updated branding, new landing pages, blog integration, SEO optimization, and analytics dashboard.',
      status: 'completed',
      dueDate: d(-5),
      owner: manager._id,
      members: [
        { user: manager._id, role: 'admin' },
        { user: sara._id, role: 'member' },
        { user: lisa._id, role: 'member' },
      ],
    });

    console.log('Projects created: 5');

    // ──────────────────────────── TASKS ────────────────────────────
    // --- Project 1: E-Commerce ---
    const t1 = await Task.create({ title: 'Design homepage wireframes', description: 'Create detailed wireframes for the new homepage layout including hero section, featured products carousel, and navigation mega-menu.', project: p1._id, assignedTo: sara._id, createdBy: admin._id, priority: 'high', status: 'completed', dueDate: d(-2) });
    const t2 = await Task.create({ title: 'Implement JWT authentication', description: 'Set up JWT-based authentication with login, register, password reset, and token refresh functionality.', project: p1._id, assignedTo: john._id, createdBy: admin._id, priority: 'high', status: 'in-progress', dueDate: d(7) });
    const t3 = await Task.create({ title: 'Build product listing page', description: 'Create the product catalog page with advanced filtering by category, price range, ratings, and sorting options with pagination.', project: p1._id, assignedTo: sara._id, createdBy: admin._id, priority: 'medium', status: 'in-progress', dueDate: d(12) });
    const t4 = await Task.create({ title: 'Shopping cart & checkout flow', description: 'Implement the multi-step checkout process with cart management, address selection, payment integration (Stripe), and order confirmation.', project: p1._id, assignedTo: emma._id, createdBy: admin._id, priority: 'high', status: 'pending', dueDate: d(20) });
    const t5 = await Task.create({ title: 'Write API documentation', description: 'Document all REST API endpoints using Swagger/OpenAPI with request/response examples and authentication requirements.', project: p1._id, assignedTo: john._id, createdBy: admin._id, priority: 'low', status: 'pending', dueDate: d(-3) });

    // --- Project 2: Mobile App ---
    const t6 = await Task.create({ title: 'Setup React Native project', description: 'Initialize the React Native project with TypeScript, configure navigation (React Navigation), and set up the project structure.', project: p2._id, assignedTo: mike._id, createdBy: admin._id, priority: 'high', status: 'completed', dueDate: d(-5) });
    const t7 = await Task.create({ title: 'Design mobile navigation', description: 'Implement bottom tab navigation and drawer navigation following Material Design 3 guidelines with smooth animations.', project: p2._id, assignedTo: raj._id, createdBy: admin._id, priority: 'medium', status: 'in-progress', dueDate: d(10) });
    const t8 = await Task.create({ title: 'Push notification service', description: 'Integrate Firebase Cloud Messaging for push notifications on both iOS and Android with deep linking support.', project: p2._id, assignedTo: mike._id, createdBy: admin._id, priority: 'medium', status: 'pending', dueDate: d(25) });
    const t9 = await Task.create({ title: 'Offline data sync', description: 'Implement offline-first architecture using WatermelonDB for local storage and background sync when connectivity is restored.', project: p2._id, assignedTo: raj._id, createdBy: admin._id, priority: 'high', status: 'pending', dueDate: d(30) });

    // --- Project 3: HR Portal ---
    const t10 = await Task.create({ title: 'Employee onboarding workflow', description: 'Build the multi-step onboarding wizard for new employees including document upload, policy acknowledgement, and IT setup request.', project: p3._id, assignedTo: lisa._id, createdBy: manager._id, priority: 'high', status: 'in-progress', dueDate: d(14) });
    const t11 = await Task.create({ title: 'Leave management module', description: 'Develop leave application, approval workflow, balance tracking, and calendar view for team leave visibility.', project: p3._id, assignedTo: emma._id, createdBy: manager._id, priority: 'medium', status: 'pending', dueDate: d(21) });
    const t12 = await Task.create({ title: 'Payroll integration API', description: 'Create REST API endpoints for payroll data exchange with the external ADP payroll system, including salary slip generation.', project: p3._id, assignedTo: john._id, createdBy: manager._id, priority: 'high', status: 'pending', dueDate: d(35) });
    const t13 = await Task.create({ title: 'Performance review dashboard', description: 'Build the 360-degree performance review system with goal setting, self-assessment, peer reviews, and manager ratings.', project: p3._id, assignedTo: lisa._id, createdBy: manager._id, priority: 'low', status: 'pending', dueDate: d(45) });

    // --- Project 4: DevOps ---
    const t14 = await Task.create({ title: 'Kubernetes cluster setup', description: 'Provision and configure the production Kubernetes cluster on AWS EKS with proper node groups, networking, and security policies.', project: p4._id, assignedTo: raj._id, createdBy: admin._id, priority: 'high', status: 'pending', dueDate: d(40) });
    const t15 = await Task.create({ title: 'CI/CD pipeline with GitHub Actions', description: 'Configure end-to-end CI/CD pipelines with automated testing, Docker image builds, staging deployments, and production rollouts.', project: p4._id, assignedTo: mike._id, createdBy: admin._id, priority: 'medium', status: 'completed', dueDate: d(-1) });
    const t16 = await Task.create({ title: 'Monitoring & alerting setup', description: 'Deploy Prometheus + Grafana stack for infrastructure monitoring with PagerDuty integration for critical alerts.', project: p4._id, assignedTo: raj._id, createdBy: admin._id, priority: 'medium', status: 'pending', dueDate: d(50) });

    // --- Project 5: Marketing Website (completed) ---
    const t17 = await Task.create({ title: 'Redesign landing pages', description: 'Create 5 new landing pages with A/B testing variants, conversion-optimized layouts, and responsive design.', project: p5._id, assignedTo: sara._id, createdBy: manager._id, priority: 'high', status: 'completed', dueDate: d(-10) });
    const t18 = await Task.create({ title: 'Blog CMS integration', description: 'Integrate Contentful CMS for the blog section with automatic sitemap generation and social media meta tags.', project: p5._id, assignedTo: lisa._id, createdBy: manager._id, priority: 'medium', status: 'completed', dueDate: d(-8) });
    const t19 = await Task.create({ title: 'SEO audit & optimization', description: 'Conduct comprehensive SEO audit, fix technical SEO issues, optimize page speed, and implement structured data markup.', project: p5._id, assignedTo: sara._id, createdBy: manager._id, priority: 'high', status: 'completed', dueDate: d(-6) });
    const t20 = await Task.create({ title: 'Analytics dashboard setup', description: 'Configure Google Analytics 4 with custom events, conversion tracking, and a Looker Studio dashboard for marketing KPIs.', project: p5._id, assignedTo: lisa._id, createdBy: manager._id, priority: 'low', status: 'completed', dueDate: d(-4) });

    console.log('Tasks created: 20');

    // ──────────────────────────── COMMENTS ────────────────────────────
    const comments = [
      // t1 – homepage wireframes
      { task: t1._id, author: admin._id, text: 'Great job on the wireframes! The hero section looks really clean and modern.' },
      { task: t1._id, author: sara._id, text: 'Thanks! I incorporated the feedback from the design review session. Updated the mobile breakpoints too.' },
      { task: t1._id, author: emma._id, text: 'Love the product carousel concept. Can we add lazy-loading for the images?' },
      // t2 – JWT auth
      { task: t2._id, author: john._id, text: 'JWT implementation is almost done. Refresh token logic is working, just need to add rate limiting.' },
      { task: t2._id, author: admin._id, text: 'Make sure to add proper CORS headers for the mobile app origins as well.' },
      // t3 – product listing
      { task: t3._id, author: sara._id, text: 'Working on the filter sidebar. The price range slider is tricky but should be done by tomorrow.' },
      { task: t3._id, author: john._id, text: 'I can help with the backend pagination API if you need it.' },
      // t4 – checkout
      { task: t4._id, author: emma._id, text: 'Starting on the Stripe integration. Has anyone set up the test API keys yet?' },
      { task: t4._id, author: admin._id, text: 'Yes, test keys are in the shared vault. Check the #dev-secrets channel.' },
      // t5 – API docs (overdue)
      { task: t5._id, author: admin._id, text: 'This is overdue now. Please prioritize finishing the API docs this week.' },
      { task: t5._id, author: john._id, text: 'Sorry for the delay – was blocked on the auth task. Will get this done by Wednesday.' },
      // t6 – RN setup
      { task: t6._id, author: mike._id, text: 'Project is set up with TypeScript template. Added ESLint, Prettier, and Husky pre-commit hooks.' },
      { task: t6._id, author: raj._id, text: 'Looks great. I cloned and ran it on both iOS sim and Android emulator – no issues.' },
      // t7 – mobile nav
      { task: t7._id, author: raj._id, text: 'Bottom tabs are working. Experimenting with shared element transitions for the drawer.' },
      { task: t7._id, author: admin._id, text: 'Please follow Material Design 3 guidelines for the navigation patterns.' },
      // t8 – push notifications
      { task: t8._id, author: mike._id, text: 'Firebase project is created. Need iOS certificates from the Apple Developer account.' },
      // t9 – offline sync
      { task: t9._id, author: raj._id, text: 'Researching WatermelonDB vs Realm for offline storage. Will share a comparison doc.' },
      { task: t9._id, author: mike._id, text: "I've used WatermelonDB before - it handles sync conflicts well. Happy to pair on this." },
      // t10 – onboarding
      { task: t10._id, author: lisa._id, text: 'Step 1 (personal info) and Step 2 (document upload) forms are done. Working on Step 3.' },
      { task: t10._id, author: manager._id, text: 'Looking good! Make sure the document upload supports PDF and DOCX formats up to 10MB.' },
      // t11 – leave management
      { task: t11._id, author: emma._id, text: 'Starting the database schema design for leave types, balances, and approval hierarchy.' },
      // t12 – payroll
      { task: t12._id, author: john._id, text: 'Reviewed the ADP API docs. Their OAuth flow is a bit unusual – will need extra testing.' },
      // t14 – k8s cluster
      { task: t14._id, author: raj._id, text: 'Waiting for AWS account access to be approved. ETA from IT is next Monday.' },
      // t15 – CI/CD
      { task: t15._id, author: mike._id, text: 'CI/CD pipeline is fully configured and tested. Staging deploys automatically on PR merge.' },
      { task: t15._id, author: admin._id, text: 'Excellent work! This will save us a lot of time. Added Slack notifications too.' },
      // t17 – landing pages
      { task: t17._id, author: sara._id, text: 'All 5 landing pages are live. A/B tests are running – initial results look promising.' },
      { task: t17._id, author: manager._id, text: "The conversion rate on variant B is 23% higher. Let's make that the default." },
      // t18 – blog CMS
      { task: t18._id, author: lisa._id, text: 'Contentful integration is complete. Authors can publish directly from the CMS.' },
      // t19 – SEO
      { task: t19._id, author: sara._id, text: 'Core Web Vitals are all green now. LCP improved from 3.2s to 1.1s after optimizations.' },
      { task: t19._id, author: manager._id, text: 'Fantastic improvement! Organic traffic is already up 18% since the changes went live.' },
      // t20 – analytics
      { task: t20._id, author: lisa._id, text: 'GA4 is configured with 12 custom events. Looker Studio dashboard has 6 report pages.' },
      { task: t20._id, author: manager._id, text: 'Shared the dashboard link with the marketing team. They love it!' },
    ];

    await Comment.insertMany(comments);
    console.log(`Comments created: ${comments.length}`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n┌──────────────────────────────────────────────┐');
    console.log('│            TEST CREDENTIALS                  │');
    console.log('├──────────────────────────────────────────────┤');
    console.log('│  Admin:  admin@taskflow.com  /  Admin@123    │');
    console.log('│  Admin:  priya@taskflow.com  /  Priya@123    │');
    console.log('│  Member: john@taskflow.com   /  John@123     │');
    console.log('│  Member: sara@taskflow.com   /  Sara@123     │');
    console.log('│  Member: mike@taskflow.com   /  Mike@123     │');
    console.log('│  Member: emma@taskflow.com   /  Emma@123     │');
    console.log('│  Member: raj@taskflow.com    /  Raje@123     │');
    console.log('│  Member: lisa@taskflow.com   /  Lisa@123     │');
    console.log('└──────────────────────────────────────────────┘');
    console.log('\nData summary:');
    console.log('  Users: 8 (2 admins, 6 members)');
    console.log('  Projects: 5 (3 active, 1 on-hold, 1 completed)');
    console.log('  Tasks: 20 (5 completed, 4 in-progress, 9 pending, 2 overdue)');
    console.log(`  Comments: ${comments.length}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
