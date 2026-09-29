const bcrypt = require('bcryptjs');

function getSeedData() {
  const passwordHash = bcrypt.hashSync('password123', 10);

  const recruiter = {
    id: 'rec_priya_01',
    name: 'Priya Sharma',
    email: 'priya.sharma@hirerecall.ai',
    password: passwordHash,
    role: 'Senior Tech Recruiter & Bar Raiser',
    company: 'HireRecall Tech Labs',
    preferences: {
      focus: 'Practical coding, System Design, Communication',
      style: 'Scenario-based, Real-world architecture problems',
      note: 'Prefers deep architecture scenarios over theoretical trivia'
    },
    createdAt: '2026-09-01T09:00:00.000Z'
  };

  const roles = [
    {
      id: 'role_backend_01',
      title: 'Backend Developer',
      department: 'Core Engineering',
      level: 'Senior / L5',
      requiredSkills: ['Python', 'FastAPI', 'MongoDB', 'REST APIs', 'System Design'],
      preferredSkills: ['Docker', 'Redis', 'AWS', 'Distributed Systems'],
      description: 'Looking for an experienced backend engineer to architect resilient, high-volume microservices using FastAPI, MongoDB, and modern caching architectures.',
      evaluationRubric: {
        'Python Fundamentals': 'Deep mastery of async/await, memory management, and concurrency.',
        'API Design': 'REST principles, idempotent endpoints, error handling, rate limiting.',
        'Database Architecture': 'Schema design, compound indexes, B-tree lookups, aggregation pipeline tuning.',
        'System Design': 'Scalability, caching strategies, backpressure, distributed consensus.'
      }
    },
    {
      id: 'role_frontend_01',
      title: 'Frontend Developer',
      department: 'Product UI',
      level: 'Mid-Senior / L4-L5',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management'],
      preferredSkills: ['Next.js', 'Vite', 'Webpack Tuning', 'Performance Profiling'],
      description: 'Design intuitive, ultra-fast interfaces for complex data workflows with React and TypeScript.',
      evaluationRubric: {
        'React & Component Architecture': 'Clean separation of concerns, custom hooks, atomic components.',
        'Performance': 'Bundle reduction, virtualized lists, memoization.',
        'UI/UX Polish': 'Accessibility, responsive layouts, microinteractions.'
      }
    },
    {
      id: 'role_ml_01',
      title: 'Machine Learning Engineer',
      department: 'AI & Data Science',
      level: 'Senior / L5',
      requiredSkills: ['Python', 'PyTorch', 'Transformers', 'Model Deployment'],
      preferredSkills: ['ONNX', 'Triton', 'vLLM', 'Distributed Training'],
      description: 'Scale our generative intelligence models, fine-tune domain-specific agents, and optimize production inference latencies.',
      evaluationRubric: {
        'ML Fundamentals': 'Attention mechanisms, loss function formulation, evaluation metrics.',
        'Production Deployment': 'Serving architectures, model quantization, latency optimization.'
      }
    }
  ];

  const candidateRahul = {
    id: 'cand_rahul_01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    role: 'Backend Developer',
    roleId: 'role_backend_01',
    experience: '2 years',
    status: 'Interviewing',
    currentRound: 'Round 3 Upcoming',
    matchScore: 88,
    resume: {
      summary: 'Backend Developer with 2 years of hands-on experience designing REST APIs and microservices using Python, FastAPI, MongoDB, and Docker.',
      skills: ['Python', 'FastAPI', 'MongoDB', 'REST APIs', 'Docker', 'Git', 'Linux'],
      education: 'B.Tech in Computer Science, VNRVJIET',
      experienceYears: '2 years',
      projects: [
        'High-throughput REST API Gateway with FastAPI and Redis caching',
        'Document indexing pipeline for high-concurrency order catalog'
      ]
    },
    tags: ['Python', 'FastAPI', 'MongoDB', 'Indexing Gap', 'Strong APIs'],
    lastActivity: '2026-09-20T16:30:00.000Z',
    createdAt: '2026-09-10T10:00:00.000Z'
  };

  const candidateAnanya = {
    id: 'cand_ananya_02',
    name: 'Ananya Rao',
    email: 'ananya.rao@example.com',
    phone: '+91 98123 45678',
    role: 'Frontend Developer',
    roleId: 'role_frontend_01',
    experience: '4 years',
    status: 'Interviewing',
    currentRound: 'Round 2 Completed',
    matchScore: 92,
    resume: {
      summary: 'Frontend Engineer with 4 years building interactive SaaS applications with React, TypeScript, and modern CSS.',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Jest'],
      education: 'B.E. in Information Technology, Osmania University',
      experienceYears: '4 years',
      projects: [
        'Real-time analytics dashboard with React and WebSockets',
        'Design system component library adopted across 12 teams'
      ]
    },
    tags: ['React', 'TypeScript', 'UI Polish', 'Webpack Gap'],
    lastActivity: '2026-09-22T14:15:00.000Z',
    createdAt: '2026-09-12T11:00:00.000Z'
  };

  const candidateArjun = {
    id: 'cand_arjun_03',
    name: 'Arjun Kumar',
    email: 'arjun.kumar@example.com',
    phone: '+91 97654 32109',
    role: 'Machine Learning Engineer',
    roleId: 'role_ml_01',
    experience: '3 years',
    status: 'Interviewing',
    currentRound: 'Round 1 Completed',
    matchScore: 84,
    resume: {
      summary: 'ML Engineer specializing in natural language processing, vector retrieval systems, and PyTorch model fine-tuning.',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'HuggingFace', 'Docker'],
      education: 'M.Tech in Artificial Intelligence, IIT Hyderabad',
      experienceYears: '3 years',
      projects: [
        'Domain-specific semantic search engine handling 2M embeddings',
        'Text classification pipeline with 94% F1 score'
      ]
    },
    tags: ['PyTorch', 'Transformers', 'Math Solid', 'Inference Latency Gap'],
    lastActivity: '2026-09-18T17:00:00.000Z',
    createdAt: '2026-09-14T09:30:00.000Z'
  };

  const candidates = [candidateRahul, candidateAnanya, candidateArjun];

  const interviews = [
    // Rahul - Round 1
    {
      id: 'int_rahul_r1',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      roundNumber: 1,
      roundName: 'Round 1 — Technical Screening',
      interviewer: 'Vikram Patel (Lead Backend Engineer)',
      date: '2026-09-15T11:00:00.000Z',
      outcome: 'Advanced to Round 2',
      feedback: 'Strong Python fundamentals. Good understanding of APIs. Weak understanding of database indexing.',
      strengths: [
        'Strong Python fundamentals',
        'Good understanding of APIs',
        'Clear explanations of asynchronous event loops'
      ],
      weaknesses: [
        'Weak understanding of database indexing',
        'Could not explain B-tree lookup vs full table scan'
      ],
      questions: [
        'How does Python asyncio event loop manage I/O bound concurrency?',
        'How do you structure RESTful API endpoints for idempotent operations?',
        'How does MongoDB implement indexing, and what is the difference between B-tree and hash indexes?'
      ],
      notes: 'Passed screening comfortably on language fundamentals, but database internals require close attention in Round 2.'
    },
    // Rahul - Round 2
    {
      id: 'int_rahul_r2',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      roundNumber: 2,
      roundName: 'Round 2 — API & Architecture Round',
      interviewer: 'Ananya Roy (Principal Architect)',
      date: '2026-09-20T15:00:00.000Z',
      outcome: 'Advanced to Round 3',
      feedback: 'Excellent communication. Good API design. Still struggled with database optimization. Could not clearly explain indexing strategies. Weak system design explanation.',
      strengths: [
        'Excellent communication',
        'Good API design and validation practices',
        'Thorough understanding of HTTP error handling and payloads'
      ],
      weaknesses: [
        'Still struggled with database optimization',
        'Could not clearly explain indexing strategies',
        'Weak system design explanation when asked to scale horizontally'
      ],
      questions: [
        'How would you design a distributed rate limiter in FastAPI backed by Redis?',
        'Suppose a MongoDB aggregate query is taking 3.5 seconds in production. How do you analyze the explain plan and optimize it?',
        'How would you scale this microservice horizontally when database reads become the primary bottleneck?'
      ],
      notes: 'Strong culture fit and API fundamentals. The repeated struggle with database indexing and query optimization is our main concern for Round 3.'
    },
    // Ananya - Round 1
    {
      id: 'int_ananya_r1',
      candidateId: 'cand_ananya_02',
      candidateName: 'Ananya Rao',
      roundNumber: 1,
      roundName: 'Round 1 — React & TypeScript Screening',
      interviewer: 'Deepak Joshi (Staff UI Engineer)',
      date: '2026-09-17T10:00:00.000Z',
      outcome: 'Advanced to Round 2',
      feedback: 'Deep knowledge of React 18 concurrency, hook mechanics, and TypeScript generic types.',
      strengths: ['React 18 fundamentals', 'Strict TypeScript typing', 'Component design'],
      weaknesses: ['Limited knowledge of Webpack custom plugins and bundle analysis'],
      questions: [
        'Explain how React 18 uses fiber architecture and automatic batching.',
        'Build a type-safe generic autocomplete component in TypeScript.'
      ],
      notes: 'Very impressive React developer.'
    },
    // Arjun - Round 1
    {
      id: 'int_arjun_r1',
      candidateId: 'cand_arjun_03',
      candidateName: 'Arjun Kumar',
      roundNumber: 1,
      roundName: 'Round 1 — Machine Learning Fundamentals',
      interviewer: 'Dr. Siddharth Verma (Lead AI Scientist)',
      date: '2026-09-18T16:00:00.000Z',
      outcome: 'Advanced to Round 2',
      feedback: 'Solid mathematical background in attention mechanisms and loss optimization, but lacking experience in production inference serving.',
      strengths: ['PyTorch modeling', 'Attention mechanisms', 'Linear algebra'],
      weaknesses: ['Production inference serving', 'Quantization (int8/fp16)', 'Latency profiling'],
      questions: [
        'Derive scaled dot-product attention and explain why scaling is necessary.',
        'How would you serve this PyTorch model with sub-50ms latency under high load?'
      ],
      notes: 'Great researcher; need to probe production serving in next round.'
    }
  ];

  const memories = [
    // Rahul - World Fact
    {
      id: 'mem_fact_rahul_01',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'world_fact',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 0,
      title: 'Resume & Baseline Qualifications',
      content: 'Candidate Rahul Sharma has 2 years of backend engineering experience with Python, FastAPI, MongoDB, REST APIs, and Docker. Applied for Senior Backend Developer.',
      skillTag: 'Python',
      metadata: {
        skills: ['Python', 'FastAPI', 'MongoDB', 'REST APIs', 'Docker'],
        experience: '2 years',
        education: 'B.Tech in Computer Science'
      },
      timestamp: '2026-09-10T10:05:00.000Z'
    },
    // Rahul - Round 1 Episodic Experience
    {
      id: 'mem_exp_rahul_r1',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'experience',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 1,
      interviewer: 'Vikram Patel',
      title: 'Round 1 Technical Screening',
      content: 'Technical screening covered Python core, asyncio concurrency, and MongoDB indexing. Candidate performed strongly on Python and API routing, but struggled with B-tree index concepts.',
      metadata: { roundNumber: 1, outcome: 'Advanced to Round 2' },
      timestamp: '2026-09-15T12:00:00.000Z'
    },
    // Rahul - Round 1 Observation: Strength Python
    {
      id: 'mem_obs_rahul_r1_s1',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'strength',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 1,
      title: 'Strength Observed: Python Fundamentals',
      content: 'In Round 1, candidate demonstrated proficiency: "Strong Python fundamentals, good grasp of language constructs."',
      skillTag: 'Python',
      sentiment: 'positive',
      timestamp: '2026-09-15T12:05:00.000Z'
    },
    // Rahul - Round 1 Observation: Strength API
    {
      id: 'mem_obs_rahul_r1_s2',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'strength',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 1,
      title: 'Strength Observed: API Design',
      content: 'In Round 1, candidate demonstrated proficiency: "Good understanding of REST APIs and endpoint conventions."',
      skillTag: 'API Design',
      sentiment: 'positive',
      timestamp: '2026-09-15T12:05:00.000Z'
    },
    // Rahul - Round 1 Observation: Weakness Indexing
    {
      id: 'mem_obs_rahul_r1_w1',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'weakness',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 1,
      title: 'Area to Investigate: Database Indexing',
      content: 'In Round 1, candidate exhibited gap or difficulty: "Weak understanding of database indexing and B-tree lookup mechanics."',
      skillTag: 'Database Architecture',
      sentiment: 'negative',
      timestamp: '2026-09-15T12:05:00.000Z'
    },
    // Rahul - Round 2 Episodic Experience
    {
      id: 'mem_exp_rahul_r2',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'experience',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 2,
      interviewer: 'Ananya Roy',
      title: 'Round 2 API & Architecture Round',
      content: 'Architectural evaluation focusing on rate limiting, query optimization, and horizontal scalability. Candidate was articulate and designed clean API boundaries, but struggled again with database optimization and horizontal scaling.',
      metadata: { roundNumber: 2, outcome: 'Advanced to Round 3' },
      timestamp: '2026-09-20T16:00:00.000Z'
    },
    // Rahul - Round 2 Observation: Strength Communication
    {
      id: 'mem_obs_rahul_r2_s1',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'strength',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 2,
      title: 'Strength Observed: Communication',
      content: 'In Round 2, candidate demonstrated proficiency: "Excellent communication and professional technical presentation."',
      skillTag: 'Communication',
      sentiment: 'positive',
      timestamp: '2026-09-20T16:05:00.000Z'
    },
    // Rahul - Round 2 Observation: Strength API Design
    {
      id: 'mem_obs_rahul_r2_s2',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'strength',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 2,
      title: 'Strength Observed: API Design',
      content: 'In Round 2, candidate demonstrated proficiency: "Good API design and structured validation handling."',
      skillTag: 'API Design',
      sentiment: 'positive',
      timestamp: '2026-09-20T16:05:00.000Z'
    },
    // Rahul - Round 2 Observation: Weakness DB Optimization
    {
      id: 'mem_obs_rahul_r2_w1',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'weakness',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 2,
      title: 'Area to Investigate: Query Optimization',
      content: 'In Round 2, candidate exhibited gap or difficulty: "Still struggled with database optimization and explain plan interpretation."',
      skillTag: 'Query Optimization',
      sentiment: 'negative',
      timestamp: '2026-09-20T16:05:00.000Z'
    },
    // Rahul - Round 2 Observation: Weakness Indexing Strategies
    {
      id: 'mem_obs_rahul_r2_w2',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'weakness',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 2,
      title: 'Area to Investigate: Indexing Strategies',
      content: 'In Round 2, candidate exhibited gap or difficulty: "Could not clearly explain indexing strategies for compound queries."',
      skillTag: 'Database Architecture',
      sentiment: 'negative',
      timestamp: '2026-09-20T16:05:00.000Z'
    },
    // Rahul - Round 2 Observation: Weakness System Design
    {
      id: 'mem_obs_rahul_r2_w3',
      candidateId: 'cand_rahul_01',
      candidateName: 'Rahul Sharma',
      type: 'observation',
      subType: 'weakness',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 2,
      title: 'Area to Investigate: System Design',
      content: 'In Round 2, candidate exhibited gap or difficulty: "Weak system design explanation when asked to scale horizontally."',
      skillTag: 'System Design',
      sentiment: 'negative',
      timestamp: '2026-09-20T16:05:00.000Z'
    },
    // Ananya Memory
    {
      id: 'mem_ananya_01',
      candidateId: 'cand_ananya_02',
      candidateName: 'Ananya Rao',
      type: 'observation',
      subType: 'strength',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 1,
      title: 'Strength Observed: React Architecture',
      content: 'In Round 1, candidate demonstrated exceptional understanding of React 18 fiber reconciler and hooks.',
      skillTag: 'Frontend & UI',
      sentiment: 'positive',
      timestamp: '2026-09-17T11:00:00.000Z'
    },
    // Arjun Memory
    {
      id: 'mem_arjun_01',
      candidateId: 'cand_arjun_03',
      candidateName: 'Arjun Kumar',
      type: 'observation',
      subType: 'weakness',
      bankId: 'hirerecall_recruitment_v1',
      roundNumber: 1,
      title: 'Area to Investigate: Model Latency Profiling',
      content: 'In Round 1, candidate showed limited knowledge of TensorRT and sub-50ms inference deployment.',
      skillTag: 'General Technical',
      sentiment: 'negative',
      timestamp: '2026-09-18T17:00:00.000Z'
    }
  ];

  return {
    recruiters: [recruiter],
    roles,
    candidates,
    interviews,
    memories,
    metrics: {
      retentionEvents: memories.length,
      recallQueries: 48,
      memoryUpdates: 16,
      activeBanks: 1
    },
    settings: {
      recruiter: {
        name: 'Priya Sharma',
        email: 'priya.sharma@hirerecall.ai',
        role: 'Senior Tech Recruiter & Bar Raiser',
        focus: 'Practical coding, System Design, Communication',
        style: 'Scenario-based, Real-world architecture problems'
      },
      hindsightMode: 'embedded',
      aiProvider: 'embedded'
    }
  };
}

module.exports = {
  getSeedData
};
