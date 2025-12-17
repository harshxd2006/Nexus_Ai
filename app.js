// Neural Network Animation - Improved with cleanup
class NeuralNetwork {
  constructor() {
    this.canvas = document.getElementById('neural-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.connections = [];
    this.animationId = null;
    this.resizeObserver = null;
    this.init();
  }

  init() {
    this.resize();
    this.createNodes();
    this.createConnections();
    this.animate();
    this.setupEventListeners();
  }

  setupEventListeners() {
    const resizeHandler = () => this.resize();
    window.addEventListener('resize', resizeHandler);
    this.resizeObserver = { handler: resizeHandler };
  }

  cleanup() {
    if (this.resizeObserver) {
      window.removeEventListener('resize', this.resizeObserver.handler);
    }
    this.stop();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.createNodes();
    this.createConnections();
  }

  createNodes() {
    if (!this.canvas) return;
    const nodeCount = Math.min(
      Math.floor((this.canvas.width * this.canvas.height) / 15000),
      500 // Maximum nodes for performance
    );
    this.nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      this.nodes.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  createConnections() {
    this.connections = [];
    const maxDistance = 150;
    const maxConnections = 800;
    
    for (let i = 0; i < this.nodes.length && this.connections.length < maxConnections; i++) {
      for (let j = i + 1; j < this.nodes.length && this.connections.length < maxConnections; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          this.connections.push({
            node1: this.nodes[i],
            node2: this.nodes[j],
            opacity: (maxDistance - distance) / maxDistance * 0.3
          });
        }
      }
    }
  }

  animate() {
    if (!this.canvas) return;
    
    this.animationId = requestAnimationFrame(() => {
      this.update();
      this.draw();
      this.animate();
    });
  }

  update() {
    this.nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      
      if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw connections first (behind nodes)
    this.connections.forEach(conn => {
      const dx = conn.node1.x - conn.node2.x;
      const dy = conn.node1.y - conn.node2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        this.ctx.beginPath();
        this.ctx.moveTo(conn.node1.x, conn.node1.y);
        this.ctx.lineTo(conn.node2.x, conn.node2.y);
        this.ctx.strokeStyle = `rgba(0, 242, 255, ${(150 - distance) / 150 * 0.2})`;
        this.ctx.stroke();
      }
    });

    // Draw nodes
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 242, 255, ${node.opacity})`;
      this.ctx.fill();
    });
  }

  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}




// AI Tools Database
const aiToolsDatabase = {
  'content-creation': [
    { name: 'ChatGPT', description: 'Advanced AI writing assistant for content creation', icon: '✍️', tags: ['Writing', 'Content', 'AI Chat'], rating: '⭐⭐⭐⭐⭐', url: 'https://chat.openai.com' , price: 'paid', releaseDate: '2023-06-21', popularityScore: 94},
    { name: 'Jasper AI', description: 'AI copywriting tool for marketing content', icon: '📝', tags: ['Copywriting', 'Marketing', 'Content'], rating: '⭐⭐⭐⭐☆', url: 'https://jasper.ai' , price: 'paid', releaseDate: '2024-01-19', popularityScore: 68},
    { name: 'Copy.ai', description: 'AI-powered copywriting and content generation', icon: '🖊️', tags: ['Copywriting', 'Content', 'Marketing'], rating: '⭐⭐⭐⭐☆', url: 'https://copy.ai' , price: 'free', releaseDate: '2023-07-26', popularityScore: 76}
  ],
  'image-generation': [
    { name: 'DALL-E 3', description: 'Create stunning images from text descriptions', icon: '🎨', tags: ['Image Generation', 'AI Art', 'Creative'], rating: '⭐⭐⭐⭐⭐', url: 'https://openai.com/dall-e-3' , price: 'free', releaseDate: '2024-12-17', popularityScore: 86},
    { name: 'Midjourney', description: 'AI art generation with unique artistic styles', icon: '🖼️', tags: ['AI Art', 'Creative', 'Design'], rating: '⭐⭐⭐⭐⭐', url: 'https://midjourney.com' , price: 'paid', releaseDate: '2024-02-28', popularityScore: 86},
    { name: 'Stable Diffusion', description: 'Open-source AI image generation model', icon: '🎭', tags: ['Open Source', 'AI Art', 'Image Generation'], rating: '⭐⭐⭐⭐☆', url: 'https://stability.ai' , price: 'free', releaseDate: '2024-07-27', popularityScore: 72}
  ],
  'code-assistance': [
    { name: 'GitHub Copilot', description: 'AI pair programmer for code completion', icon: '👨‍💻', tags: ['Coding', 'AI Assistant', 'Programming'], rating: '⭐⭐⭐⭐⭐', url: 'https://github.com/features/copilot' , price: 'free', releaseDate: '2023-09-09', popularityScore: 83},
    { name: 'Claude Code', description: 'AI coding assistant for complex programming tasks', icon: '💻', tags: ['Coding', 'AI Assistant', 'Development'], rating: '⭐⭐⭐⭐⭐', url: 'https://claude.ai' , price: 'paid', releaseDate: '2024-11-08', popularityScore: 92},
    { name: 'Tabnine', description: 'AI code completion for multiple programming languages', icon: '⚡', tags: ['Code Completion', 'AI', 'Programming'], rating: '⭐⭐⭐⭐☆', url: 'https://tabnine.com' , price: 'free', releaseDate: '2025-02-07', popularityScore: 93}
  ],
  'marketing': [
    { name: 'HubSpot AI', description: 'AI-powered marketing automation and analytics', icon: '📈', tags: ['Marketing', 'Automation', 'Analytics'], rating: '⭐⭐⭐⭐⭐', url: 'https://hubspot.com' , price: 'free', releaseDate: '2024-07-12', popularityScore: 98},
    { name: 'Semrush', description: 'AI-driven SEO and marketing analytics platform', icon: '🔍', tags: ['SEO', 'Marketing', 'Analytics'], rating: '⭐⭐⭐⭐⭐', url: 'https://semrush.com' , price: 'free', releaseDate: '2024-06-11', popularityScore: 79},
    { name: 'Buffer AI', description: 'AI-powered social media scheduling and optimization', icon: '📱', tags: ['Social Media', 'Scheduling', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://buffer.com' , price: 'paid', releaseDate: '2025-05-01', popularityScore: 58}
  ],
  'education': [
    { name: 'Khan Academy AI', description: 'Personalized AI tutoring and learning assistance', icon: '🎓', tags: ['Education', 'Tutoring', 'Learning'], rating: '⭐⭐⭐⭐⭐', url: 'https://khanacademy.org' , price: 'free', releaseDate: '2024-06-24', popularityScore: 55},
    { name: 'Duolingo', description: 'AI-powered language learning platform', icon: '🌐', tags: ['Language Learning', 'Education', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://duolingo.com' , price: 'paid', releaseDate: '2024-01-13', popularityScore: 84},
    { name: 'Coursera AI', description: 'AI-enhanced online courses and learning paths', icon: '📚', tags: ['Online Learning', 'Courses', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://coursera.org' , price: 'free', releaseDate: '2025-05-30', popularityScore: 78}
  ],
  'video-editing': [
    { name: 'Runway ML', description: 'AI-powered video editing and generation tools', icon: '🎬', tags: ['Video Editing', 'AI Generation', 'Creative'], rating: '⭐⭐⭐⭐⭐', url: 'https://runwayml.com' , price: 'paid', releaseDate: '2024-07-03', popularityScore: 81},
    { name: 'Pictory', description: 'AI video creation from text and scripts', icon: '📹', tags: ['Video Creation', 'AI', 'Content'], rating: '⭐⭐⭐⭐☆', url: 'https://pictory.ai' , price: 'free', releaseDate: '2024-07-06', popularityScore: 75},
    { name: 'Loom AI', description: 'AI-enhanced screen recording and video messaging', icon: '🎥', tags: ['Screen Recording', 'Video', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://loom.com' , price: 'paid', releaseDate: '2025-05-28', popularityScore: 92}
  ],
  'music-audio': [
    { name: 'AIVA', description: 'AI composer for original music creation', icon: '🎵', tags: ['Music Composition', 'AI', 'Creative'], rating: '⭐⭐⭐⭐☆', url: 'https://aiva.ai' , price: 'paid', releaseDate: '2024-09-18', popularityScore: 94},
    { name: 'Mubert', description: 'AI-generated royalty-free music for content', icon: '🎶', tags: ['Music Generation', 'Royalty-Free', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://mubert.com' , price: 'free', releaseDate: '2023-07-20', popularityScore: 66},
    { name: 'Descript', description: 'AI-powered audio editing and transcription', icon: '🎙️', tags: ['Audio Editing', 'Transcription', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://descript.com' , price: 'free', releaseDate: '2024-06-01', popularityScore: 72}
  ],
  'business-automation': [
    { name: 'Zapier', description: 'AI-powered workflow automation between apps', icon: '⚡', tags: ['Automation', 'Workflow', 'Integration'], rating: '⭐⭐⭐⭐⭐', url: 'https://zapier.com' , price: 'paid', releaseDate: '2023-08-06', popularityScore: 90},
    { name: 'UiPath', description: 'AI-enhanced robotic process automation', icon: '🤖', tags: ['RPA', 'Automation', 'Business'], rating: '⭐⭐⭐⭐☆', url: 'https://uipath.com' , price: 'free', releaseDate: '2024-05-28', popularityScore: 68},
    { name: 'Monday.ai', description: 'AI-powered project management and automation', icon: '📋', tags: ['Project Management', 'Automation', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://monday.com' , price: 'free', releaseDate: '2024-12-14', popularityScore: 77}
  ],
  'data-analysis': [
    { name: 'Tableau AI', description: 'AI-powered data visualization and analytics', icon: '📊', tags: ['Data Visualization', 'Analytics', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://tableau.com' , price: 'free', releaseDate: '2023-12-09', popularityScore: 91},
    { name: 'DataRobot', description: 'Automated machine learning platform', icon: '🔬', tags: ['Machine Learning', 'Data Science', 'Automation'], rating: '⭐⭐⭐⭐☆', url: 'https://datarobot.com' , price: 'paid', releaseDate: '2024-10-10', popularityScore: 79},
    { name: 'H2O.ai', description: 'Open-source AI and machine learning platform', icon: '💧', tags: ['Machine Learning', 'Open Source', 'Data Science'], rating: '⭐⭐⭐⭐☆', url: 'https://h2o.ai' , price: 'paid', releaseDate: '2025-04-29', popularityScore: 71}
  ],
  'design-ui': [
    { name: 'Figma AI', description: 'AI-powered design collaboration tool', icon: '✏️', tags: ['UI/UX', 'Design', 'Collaboration'], rating: '⭐⭐⭐⭐⭐', url: 'https://figma.com' , price: 'free', releaseDate: '2024-03-01', popularityScore: 76},
    { name: 'Canva AI', description: 'AI-enhanced design platform', icon: '🎨', tags: ['Graphic Design', 'Templates', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://canva.com' , price: 'free', releaseDate: '2023-12-28', popularityScore: 56},
    { name: 'Adobe Sensei', description: 'AI and machine learning for creative tools', icon: '🧠', tags: ['Creative Suite', 'AI', 'Design'], rating: '⭐⭐⭐⭐⭐', url: 'https://adobe.com/sensei' , price: 'paid', releaseDate: '2023-06-28', popularityScore: 64},
    { name: 'Uizard', description: 'AI-powered UI design tool', icon: '📱', tags: ['UI Design', 'Prototyping', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://uizard.io' , price: 'free', releaseDate: '2023-11-25', popularityScore: 53},
    { name: 'Khroma', description: 'AI color tool for designers', icon: '🌈', tags: ['Color Palettes', 'Design', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://khroma.co' , price: 'paid', releaseDate: '2024-03-11', popularityScore: 67}
  ],
  'chatbots': [
    { name: 'Intercom Fin', description: 'AI-powered customer support chatbot', icon: '💬', tags: ['Customer Support', 'Chatbot', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://intercom.com/fin' , price: 'free', releaseDate: '2023-09-19', popularityScore: 71},
    { name: 'Drift', description: 'Conversational AI for sales and marketing', icon: '🤝', tags: ['Sales', 'Marketing', 'Chatbot'], rating: '⭐⭐⭐⭐☆', url: 'https://drift.com' , price: 'free', releaseDate: '2025-05-06', popularityScore: 97},
    { name: 'ManyChat', description: 'AI chatbot platform for Messenger', icon: '💬', tags: ['Messenger', 'Chatbot', 'Marketing'], rating: '⭐⭐⭐⭐☆', url: 'https://manychat.com' , price: 'paid', releaseDate: '2024-09-26', popularityScore: 57},
    { name: 'Ada', description: 'AI-powered customer service automation', icon: '👩‍💼', tags: ['Customer Service', 'Automation', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://ada.cx' , price: 'free', releaseDate: '2024-10-17', popularityScore: 87},
    { name: 'Tidio Lyro', description: 'AI chatbot for e-commerce', icon: '🛒', tags: ['E-commerce', 'Chatbot', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://tidio.com/lyro' , price: 'paid', releaseDate: '2025-01-03', popularityScore: 83}
  ],
  'translation': [
    { name: 'DeepL', description: 'AI-powered translation tool', icon: '🌐', tags: ['Translation', 'Language', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://deepl.com' , price: 'free', releaseDate: '2025-04-02', popularityScore: 72},
    { name: 'Google Translate AI', description: 'Neural machine translation', icon: '🔤', tags: ['Translation', 'Google', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://translate.google.com' , price: 'free', releaseDate: '2024-04-14', popularityScore: 90},
    { name: 'Unbabel', description: 'AI-powered human-refined translation', icon: '✍️', tags: ['Translation', 'Human-in-the-loop', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://unbabel.com' , price: 'free', releaseDate: '2024-02-01', popularityScore: 93},
    { name: 'Sonix', description: 'AI transcription and translation', icon: '🎙️', tags: ['Transcription', 'Translation', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://sonix.ai' , price: 'paid', releaseDate: '2024-05-11', popularityScore: 98},
    { name: 'Lilt', description: 'AI-assisted translation platform', icon: '🔄', tags: ['Translation', 'Localization', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://lilt.com' , price: 'free', releaseDate: '2023-07-03', popularityScore: 77}
  ],
  'healthcare': [
    { name: 'IBM Watson Health', description: 'AI solutions for healthcare', icon: '🏥', tags: ['Healthcare', 'Diagnostics', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://ibm.com/watson-health' , price: 'free', releaseDate: '2023-10-26', popularityScore: 95},
    { name: 'PathAI', description: 'AI-powered pathology diagnostics', icon: '🔬', tags: ['Pathology', 'Diagnostics', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://pathai.com' , price: 'paid', releaseDate: '2024-10-20', popularityScore: 77},
    { name: 'Butterfly Network', description: 'AI-powered medical imaging', icon: '🩺', tags: ['Medical Imaging', 'Diagnostics', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://butterflynetwork.com' , price: 'free', releaseDate: '2025-02-08', popularityScore: 93},
    { name: 'Tempus', description: 'AI-powered precision medicine', icon: '🧬', tags: ['Precision Medicine', 'Genomics', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://tempus.com' , price: 'free', releaseDate: '2023-11-23', popularityScore: 69},
    { name: 'Zebra Medical Vision', description: 'AI radiology assistant', icon: '📷', tags: ['Radiology', 'Diagnostics', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://zebra-med.com' , price: 'paid', releaseDate: '2023-11-23', popularityScore: 62}
  ],
  'finance': [
    { name: 'Kensho', description: 'AI for investment analysis', icon: '📈', tags: ['Investment', 'Finance', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://kensho.com' , price: 'paid', releaseDate: '2023-12-26', popularityScore: 58},
    { name: 'AlphaSense', description: 'AI-powered financial research', icon: '🔍', tags: ['Financial Research', 'Market Intelligence', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://alpha-sense.com' , price: 'paid', releaseDate: '2023-08-12', popularityScore: 87},
    { name: 'Ayasdi', description: 'AI for anti-money laundering', icon: '💰', tags: ['AML', 'Compliance', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://ayasdi.com' , price: 'free', releaseDate: '2023-12-09', popularityScore: 63},
    { name: 'Plaid', description: 'AI-powered financial data aggregation', icon: '🏦', tags: ['Banking', 'Financial Data', 'API'], rating: '⭐⭐⭐⭐⭐', url: 'https://plaid.com' , price: 'free', releaseDate: '2023-12-01', popularityScore: 96},
    { name: 'Bloomberg AI', description: 'AI-driven financial analytics', icon: '💹', tags: ['Financial Markets', 'Analytics', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://bloomberg.com/ai' , price: 'free', releaseDate: '2025-01-06', popularityScore: 69}
  ],
  'gaming': [
    { name: 'Unity ML-Agents', description: 'AI toolkit for game development', icon: '🎮', tags: ['Game Dev', 'Machine Learning', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://unity.com/products/machine-learning-agents' , price: 'paid', releaseDate: '2024-08-24', popularityScore: 69},
    { name: 'Inworld AI', description: 'AI-powered game characters', icon: '🤖', tags: ['NPCs', 'Game Characters', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://inworld.ai' , price: 'paid', releaseDate: '2025-02-23', popularityScore: 97},
    { name: 'Latitude Voyage', description: 'AI-generated adventure games', icon: '🧭', tags: ['Procedural Generation', 'Gaming', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://latitude.io' , price: 'free', releaseDate: '2025-01-05', popularityScore: 56}
  ],
  'productivity': [
    { name: 'Notion AI', description: 'AI-powered workspace assistant', icon: '📝', tags: ['Productivity', 'Organization', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://notion.so/product/ai' , price: 'paid', releaseDate: '2024-02-20', popularityScore: 98},
    { name: 'Otter.ai', description: 'AI meeting assistant with transcription', icon: '🎙️', tags: ['Transcription', 'Meetings', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://otter.ai' , price: 'paid', releaseDate: '2023-08-13', popularityScore: 87},
    { name: 'Fireflies.ai', description: 'AI meeting recorder and analyzer', icon: '🔥', tags: ['Meetings', 'Transcription', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://fireflies.ai' , price: 'paid', releaseDate: '2025-05-21', popularityScore: 59}
  ],
  'research': [
    { name: 'Elicit', description: 'AI research assistant', icon: '🔬', tags: ['Research', 'Literature Review', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://elicit.org' , price: 'paid', releaseDate: '2023-08-08', popularityScore: 72},
    { name: 'Consensus', description: 'AI-powered research search engine', icon: '📚', tags: ['Academic Research', 'Search', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://consensus.app' , price: 'free', releaseDate: '2025-02-07', popularityScore: 61},
    { name: 'Scite AI', description: 'AI for scientific article analysis', icon: '📑', tags: ['Scientific Research', 'Citations', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://scite.ai' , price: 'paid', releaseDate: '2024-02-23', popularityScore: 96}
  ],
  'social-media': [
    { name: 'Hootsuite AI', description: 'AI-powered social media management', icon: '📱', tags: ['Social Media', 'Scheduling', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://hootsuite.com' , price: 'free', releaseDate: '2025-05-17', popularityScore: 51},
    { name: 'Lately AI', description: 'AI social media content generator', icon: '✍️', tags: ['Content Generation', 'Social Media', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://lately.ai' , price: 'paid', releaseDate: '2025-05-05', popularityScore: 57},
    { name: 'Predis.ai', description: 'AI for social media content creation', icon: '🎨', tags: ['Content Creation', 'Social Media', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://predis.ai' , price: 'free', releaseDate: '2024-11-18', popularityScore: 61}
  ],
  'cybersecurity': [
    { name: 'Darktrace', description: 'AI cybersecurity defense', icon: '🛡️', tags: ['Cybersecurity', 'Threat Detection', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://darktrace.com' , price: 'free', releaseDate: '2023-08-27', popularityScore: 55},
    { name: 'CrowdStrike AI', description: 'AI-powered endpoint protection', icon: '🔒', tags: ['Endpoint Security', 'Threat Intelligence', 'AI'], rating: '⭐⭐⭐⭐⭐', url: 'https://crowdstrike.com' , price: 'free', releaseDate: '2024-09-30', popularityScore: 94},
    { name: 'Vectra AI', description: 'AI network detection and response', icon: '🌐', tags: ['Network Security', 'Threat Detection', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://vectra.ai' , price: 'paid', releaseDate: '2024-11-25', popularityScore: 80}
  ],
  'real-estate': [
    { name: 'Skyline AI', description: 'AI for real estate investment', icon: '🏢', tags: ['Real Estate', 'Investment', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://skyline.ai' , price: 'paid', releaseDate: '2024-08-11', popularityScore: 76},
    { name: 'Cherre', description: 'AI real estate data platform', icon: '📊', tags: ['Real Estate', 'Data Analytics', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://cherre.com' , price: 'free', releaseDate: '2024-02-02', popularityScore: 74},
    { name: 'Restb.ai', description: 'AI for property image analysis', icon: '🏠', tags: ['Computer Vision', 'Real Estate', 'AI'], rating: '⭐⭐⭐⭐☆', url: 'https://restb.ai' , price: 'paid', releaseDate: '2024-06-16', popularityScore: 89}
  ]
};

// Fixed and consolidated demoUrls object

var demoUrls = {
  "AIVA": "https://www.google.com/search?q=AIVA+AI+tool+demo",
  "Ada": "https://www.google.com/search?q=Ada+AI+tool+demo",
  "Adobe Sensei": "https://www.google.com/search?q=Adobe+Sensei+AI+tool+demo",
  "AlphaSense": "https://www.google.com/search?q=AlphaSense+AI+tool+demo",
  "Ayasdi": "https://www.google.com/search?q=Ayasdi+AI+tool+demo",
  "Bloomberg AI": "https://www.google.com/search?q=Bloomberg+AI+AI+tool+demo",
  "Buffer AI": "https://www.google.com/search?q=Buffer+AI+AI+tool+demo",
  "Butterfly Network": "https://www.google.com/search?q=Butterfly+Network+AI+tool+demo",
  "Canva AI": "https://www.google.com/search?q=Canva+AI+AI+tool+demo",
  "ChatGPT": "https://chat.openai.com/",
  "Cherre": "https://www.google.com/search?q=Cherre+AI+tool+demo",
  "Claude Code": "https://www.google.com/search?q=Claude+Code+AI+tool+demo",
  "Consensus": "https://www.google.com/search?q=Consensus+AI+tool+demo",
  "Copy.ai": "https://www.copy.ai/",
  "Coursera AI": "https://www.google.com/search?q=Coursera+AI+AI+tool+demo",
  "CrowdStrike AI": "https://www.google.com/search?q=CrowdStrike+AI+AI+tool+demo",
  "DALL-E 3": "https://openai.com/dall-e-3",
  "Darktrace": "https://www.google.com/search?q=Darktrace+AI+tool+demo",
  "DataRobot": "https://www.datarobot.com/",
  "DeepL": "https://www.google.com/search?q=DeepL+AI+tool+demo",
  "Descript": "https://www.descript.com/",
  "Drift": "https://www.google.com/search?q=Drift+AI+tool+demo",
  "Duolingo": "https://www.google.com/search?q=Duolingo+AI+tool+demo",
  "Elicit": "https://www.google.com/search?q=Elicit+AI+tool+demo",
  "Figma AI": "https://www.google.com/search?q=Figma+AI+AI+tool+demo",
  "Fireflies.ai": "https://www.google.com/search?q=Firefliesai+AI+tool+demo",
  "GitHub Copilot": "https://github.com/features/copilot",
  "Google Translate AI": "https://www.google.com/search?q=Google+Translate+AI+AI+tool+demo",
  "H2O.ai": "https://h2o.ai/platform/ai-cloud/",
  "Hootsuite AI": "https://www.google.com/search?q=Hootsuite+AI+AI+tool+demo",
  "HubSpot AI": "https://www.google.com/search?q=HubSpot+AI+AI+tool+demo",
  "IBM Watson Health": "https://www.google.com/search?q=IBM+Watson+Health+AI+tool+demo",
  "Intercom Fin": "https://www.google.com/search?q=Intercom+Fin+AI+tool+demo",
  "Inworld AI": "https://www.google.com/search?q=Inworld+AI+AI+tool+demo",
  "Jasper AI": "https://www.google.com/search?q=Jasper+AI+AI+tool+demo",
  "Kensho": "https://www.google.com/search?q=Kensho+AI+tool+demo",
  "Khan Academy AI": "https://www.google.com/search?q=Khan+Academy+AI+AI+tool+demo",
  "Khroma": "https://www.google.com/search?q=Khroma+AI+tool+demo",
  "Lately AI": "https://www.google.com/search?q=Lately+AI+AI+tool+demo",
  "Latitude Voyage": "https://www.google.com/search?q=Latitude+Voyage+AI+tool+demo",
  "Lilt": "https://www.google.com/search?q=Lilt+AI+tool+demo",
  "Loom AI": "https://www.google.com/search?q=Loom+AI+AI+tool+demo",
  "ManyChat": "https://www.google.com/search?q=ManyChat+AI+tool+demo",
  "Midjourney": "https://www.midjourney.com/",
  "Monday.ai": "https://www.google.com/search?q=Mondayai+AI+tool+demo",
  "Mubert": "https://www.google.com/search?q=Mubert+AI+tool+demo",
  "Notion AI": "https://notion.so/product/ai",
  "Otter.ai": "https://www.google.com/search?q=Otterai+AI+tool+demo",
  "PathAI": "https://www.google.com/search?q=PathAI+AI+tool+demo",
  "Pictory": "https://www.google.com/search?q=Pictory+AI+tool+demo",
  "Plaid": "https://www.google.com/search?q=Plaid+AI+tool+demo",
  "Predis.ai": "https://www.google.com/search?q=Predisai+AI+tool+demo",
  "Restb.ai": "https://www.google.com/search?q=Restbai+AI+tool+demo",
  "Runway ML": "https://runwayml.com/",
  "Scite AI": "https://www.google.com/search?q=Scite+AI+AI+tool+demo",
  "Semrush": "https://www.google.com/search?q=Semrush+AI+tool+demo",
  "Skyline AI": "https://www.google.com/search?q=Skyline+AI+AI+tool+demo",
  "Sonix": "https://www.google.com/search?q=Sonix+AI+tool+demo",
  "Stable Diffusion": "https://www.google.com/search?q=Stable+Diffusion+AI+tool+demo",
  "Tableau AI": "https://www.google.com/search?q=Tableau+AI+AI+tool+demo",
  "Tabnine": "https://www.google.com/search?q=Tabnine+AI+tool+demo",
  "Tempus": "https://www.google.com/search?q=Tempus+AI+tool+demo",
  "Tidio Lyro": "https://www.google.com/search?q=Tidio+Lyro+AI+tool+demo",
  "UiPath": "https://www.google.com/search?q=UiPath+AI+tool+demo",
  "Uizard": "https://www.google.com/search?q=Uizard+AI+tool+demo",
  "Unbabel": "https://www.google.com/search?q=Unbabel+AI+tool+demo",
  "Unity ML-Agents": "https://www.google.com/search?q=Unity+ML-Agents+AI+tool+demo",
  "Vectra AI": "https://www.google.com/search?q=Vectra+AI+AI+tool+demo",
  "Zapier": "https://zapier.com/",
  "Zebra Medical Vision": "https://www.google.com/search?q=Zebra+Medical+Vision+AI+tool+demo"
};

// YouTube API configuration (add this near the top with other constants)
const YOUTUBE_API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
let gapiLoaded = false;

// YouTube API Loader (add this with other utility functions)
function loadYouTubeAPI() {
  return new Promise((resolve) => {
    if (gapiLoaded) {
      resolve();
      return;
    }
    
    gapi.load('client', () => {
      gapi.client.init({
        'apiKey': YOUTUBE_API_KEY,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
      }).then(() => {
        gapiLoaded = true;
        resolve();
      }).catch(error => {
        console.error('Error loading YouTube API:', error);
        resolve(); // Still resolve to allow the app to continue
      });
    });
  });
}

// Updated video database with search queries instead of embed URLs
const videoQueries = {
  "ChatGPT": "ChatGPT official demo",
  "Midjourney": "Midjourney tutorial",
  "DALL-E 3": "DALL-E 3 demo",
  "Runway ML": "Runway ML tutorial",
  "GitHub Copilot": "GitHub Copilot demo",
  "Notion AI": "Notion AI features",
  "Stable Diffusion": "Stable Diffusion tutorial",
  "Adobe Sensei": "Adobe Sensei demo",
  "Canva AI": "Canva AI features"
};





  

// Add these new functions at the end of your app.js file (before the DOMContentLoaded event listener)

// Image viewer functionality
function openImageViewer(imgElement) {
  const viewer = document.getElementById('imageViewer');
  const viewerImg = document.getElementById('viewerImage');
  const caption = document.getElementById('imageCaption');
  
  if (!viewer || !viewerImg || !caption) return;
  
  viewerImg.src = imgElement.src;
  caption.textContent = imgElement.alt || '';
  viewer.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  function handleClose(e) {
    if (e.target === viewer || e.key === 'Escape') {
      closeImageViewer();
    }
  }
  
  viewer.addEventListener('click', handleClose);
  document.addEventListener('keydown', handleClose);
}

function closeImageViewer() {
  const viewer = document.getElementById('imageViewer');
  if (viewer) {
    viewer.style.display = 'none';
    document.body.style.overflow = '';
    viewer.removeEventListener('click', closeImageViewer);
    document.removeEventListener('keydown', closeImageViewer);
  }
}

// Add the missing helper function
function findToolByName(toolName) {
  for (const category in aiToolsDatabase) {
    const foundTool = aiToolsDatabase[category].find(tool => tool.name === toolName);
    if (foundTool) return foundTool;
  }
  return null;
}
// Replace the existing showDemo function with this:
function showDemo(toolName, customUrl = null) {
  const modal = document.getElementById('demoModal');
  const title = document.getElementById('demoTitle');
  const officialBtn = document.getElementById('officialDemoBtn');
  const previewBtn = document.getElementById('previewDemoBtn');
  const videoBtn = document.getElementById('videoDemoBtn');
  
  if (!modal || !title || !officialBtn || !previewBtn) return;
  
  // Set title
  title.textContent = `${toolName} Demo Options`;
  
  // Get demo URL
  const demoUrl = customUrl || demoUrls[toolName];
  
  // Configure official demo button
  officialBtn.onclick = function() {
    if (demoUrl) {
      window.open(demoUrl, '_blank', 'noopener,noreferrer');
      closeDemoModal();
    } else {
      alert(`Official demo for ${toolName} is not available yet. Coming soon!`);
    }
  };
  
  // Configure preview button
  previewBtn.onclick = function() {
    showPreviewDemo(toolName);
  };
  
  // Configure video demo button if it exists
  if (videoBtn) {
    videoBtn.onclick = function() {
      showVideoDemo(toolName);
    };
    
    // Show/hide video button based on availability
    videoBtn.style.display = videoDemos[toolName] ? 'block' : 'none';
  }
  
  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Close on background click or Escape key
  function handleClose(e) {
    if (e.target === modal || e.key === 'Escape') {
      closeDemoModal();
    }
  }
  
  modal.addEventListener('click', handleClose);
  document.addEventListener('keydown', handleClose);
  
  // Cleanup event listeners when modal closes
  modal._demoModalHandlers = handleClose;
}


// Close Demo Modal
function closeDemoModal() {
  const modal = document.getElementById('demoModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    
    // Remove event listeners
    if (modal._demoModalHandlers) {
      modal.removeEventListener('click', modal._demoModalHandlers);
      document.removeEventListener('keydown', modal._demoModalHandlers);
      delete modal._demoModalHandlers;
    }
  }
}function showPreviewDemo(toolName) {
  closeDemoModal();
  const tool = findToolByName(toolName);
  
  const previewModal = document.createElement('div');
  previewModal.className = 'modal';
  previewModal.style.display = 'block';
  
  previewModal.innerHTML = `
    <div class="modal-content large-modal">
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3>${toolName} Preview</h3>
      <div class="preview-content">
        <div class="preview-screenshots">
          <img src="https://source.unsplash.com/random/600x300/?${encodeURIComponent(toolName)},tech" alt="${toolName} Screenshot" onclick="openImageViewer(this)">
          <img src="https://source.unsplash.com/random/600x300/?${encodeURIComponent(toolName)},interface" alt="${toolName} Interface" onclick="openImageViewer(this)">
        </div>
        <div class="preview-description">
          <h4>About ${toolName}</h4>
          <p>${tool?.description || 'No description available'}</p>
          
          <div class="preview-actions">
            <button onclick="openLiveDemo('${toolName}', '${tool?.url || ''}')">
              Visit Official Site
            </button>
            ${videoDemos[toolName] ? `
            <button onclick="showVideoDemo('${toolName}'); event.stopPropagation()">
              Watch Video Demo
            </button>` : ''}
          </div>
        </div>
      </div>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
  
  document.body.appendChild(previewModal);
  
  previewModal.addEventListener('click', function(e) {
    if (e.target === previewModal) {
      previewModal.remove();
    }
  });
}

function showVideoDemo(toolName) {
  closeDemoModal();
  
  // Check if we have a video for this tool
  if (!videoDemos[toolName]) {
    alert(`Sorry, we don't have a video demo available for ${toolName} yet.`);
    return;
  }

  // Extract video ID from URL
  let videoUrl = videoDemos[toolName];
  let videoId = '';
  
  // Handle different YouTube URL formats
  if (videoUrl.includes('youtube.com/embed/')) {
    videoId = videoUrl.split('youtube.com/embed/')[1];
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1];
  } else if (videoUrl.includes('v=')) {
    videoId = videoUrl.split('v=')[1];
    const ampersandPosition = videoId.indexOf('&');
    if (ampersandPosition !== -1) {
      videoId = videoId.substring(0, ampersandPosition);
    }
  } else {
    videoId = videoUrl;
  }

  // Create modal with fallback content
  const videoModal = document.createElement('div');
  videoModal.className = 'modal';
  videoModal.style.display = 'block';
  videoModal.innerHTML = `
    <div class="modal-content video-modal">
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3>${toolName} Video Demo</h3>
      <div class="video-container">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
                encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <div class="video-fallback" style="display:none; text-align:center; padding:20px;">
        <p>Video unavailable. <a href="${videoDemos[toolName]}" target="_blank">Try watching on YouTube</a></p>
      </div>
      <p>Watch this demonstration to see ${toolName} in action.</p>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
  
  document.body.appendChild(videoModal);

  // Add error handling for the iframe
  const iframe = videoModal.querySelector('iframe');
  iframe.onerror = function() {
    videoModal.querySelector('.video-fallback').style.display = 'block';
    iframe.style.display = 'none';
  };

  // Close when clicking outside content
  videoModal.addEventListener('click', function(e) {
    if (e.target === videoModal) {
      videoModal.remove();
    }
  });
}

// Preview Demo Function
function showPreviewDemo(toolName) {
  closeDemoModal();
  const previewContent = generatePreviewContent(toolName);
  
  // Create preview modal
  const previewModal = document.createElement('div');
  previewModal.className = 'modal';
  previewModal.innerHTML = `
    <div class="modal-content">
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3>${toolName} Preview</h3>
      <p>${previewContent}</p>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
  previewModal.style.display = 'block';
  document.body.appendChild(previewModal);
}


// Generate Preview Content
function generatePreviewContent(toolName) {
    const previews = {
        'AIVA': 'AIVA is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Ada': 'Ada is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Adobe Sensei': 'Adobe Sensei is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'AlphaSense': 'AlphaSense is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Ayasdi': 'Ayasdi is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Bloomberg AI': 'Bloomberg AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Buffer AI': 'Buffer AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Butterfly Network': 'Butterfly Network is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Canva AI': 'Canva AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'ChatGPT': 'AI-powered conversational assistant that can help with writing, coding, analysis, and creative tasks.',
        'Cherre': 'Cherre is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Claude Code': 'Claude Code is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Consensus': 'Consensus is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Copy.ai': 'Copy.ai is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Coursera AI': 'Coursera AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'CrowdStrike AI': 'CrowdStrike AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'DALL-E 3': 'DALL-E 3 is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Darktrace': 'Darktrace is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'DataRobot': 'DataRobot is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'DeepL': 'DeepL is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Descript': 'Descript is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Drift': 'Drift is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Duolingo': 'Duolingo is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Elicit': 'Elicit is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Figma AI': 'Figma AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Fireflies.ai': 'Fireflies.ai is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'GitHub Copilot': 'GitHub Copilot is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Google Translate AI': 'Google Translate AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'H2O.ai': 'AutoML platform for building machine learning models without extensive coding knowledge.',
        'Hootsuite AI': 'Hootsuite AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'HubSpot AI': 'HubSpot AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'IBM Watson Health': 'IBM Watson Health is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Intercom Fin': 'Intercom Fin is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Inworld AI': 'Inworld AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Jasper AI': 'Jasper AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Kensho': 'Kensho is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Khan Academy AI': 'Khan Academy AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Khroma': 'Khroma is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Lately AI': 'Lately AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Latitude Voyage': 'Latitude Voyage is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Lilt': 'Lilt is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Loom AI': 'Loom AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'ManyChat': 'ManyChat is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Midjourney': 'AI art generator that creates stunning images from text descriptions.',
        'Monday.ai': 'Monday.ai is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Mubert': 'Mubert is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Notion AI': 'AI writing assistant integrated into Notion workspace for content creation and organization.',
        'Otter.ai': 'Otter.ai is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'PathAI': 'PathAI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Pictory': 'Pictory is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Plaid': 'Plaid is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Predis.ai': 'Predis.ai is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Restb.ai': 'Restb.ai is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Runway ML': 'Runway ML is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Scite AI': 'Scite AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Semrush': 'Semrush is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Skyline AI': 'Skyline AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Sonix': 'Sonix is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Stable Diffusion': 'Stable Diffusion is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Tableau AI': 'Tableau AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Tabnine': 'Tabnine is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Tempus': 'Tempus is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Tidio Lyro': 'Tidio Lyro is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'UiPath': 'UiPath is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Uizard': 'Uizard is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Unbabel': 'Unbabel is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Unity ML-Agents': 'Unity ML-Agents is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Vectra AI': 'Vectra AI is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Zapier': 'Zapier is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
        'Zebra Medical Vision': 'Zebra Medical Vision is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!',
    };
    return previews[toolName] || `${toolName} is a powerful AI tool that enhances productivity and creativity. Try the official demo to explore all features!`;
}

// DOM Elements
let toolsGrid, categoryButtons, searchInput, loadingElement, aboutSection, favoriteToolsSection, favoritesGrid;
let currentCategory = 'all';
let compareList = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];


// Move this BEFORE initializeApp() function
function createToolCard(tool) {
  const isFavorite = favorites.includes(tool.name);
  return `
    <div class="tool-card" onclick='openToolModal(${JSON.stringify(tool)})'>
      <span class="icon">${tool.icon}</span>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tags">
        ${tool.tags.map(tag => `<span>${tag}</span>`).join('')}
      </div>
      <div class="footer">
        <span class="rating">${tool.rating}</span>
        <button onclick="event.stopPropagation(); addToCompare('${tool.name}')">Compare</button>
        <button onclick="event.stopPropagation(); toggleFavorite('${tool.name}')" style="color: ${isFavorite ? '#ff4757' : '#ccc'}">${isFavorite ? '❤️' : '🤍'}</button>
      </div>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
}

// Initialize the application
function initializeApp() {
  
  // Initialize the neural network animation
  new NeuralNetwork();

  // Get DOM elements
  toolsGrid = document.getElementById('toolsGrid');
  categoryButtons = document.querySelectorAll('.categories button');
  searchInput = document.getElementById('searchInput');
  loadingElement = document.getElementById('loading');
  aboutSection = document.getElementById('about');
  favoriteToolsSection = document.getElementById('favorite-tools');
  favoritesGrid = document.getElementById('favoritesGrid');
  
  

  // Navigation functionality
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      
      if (targetId === 'favorites') {
        showFavorites();
        return;
      }
      
      if (targetId === 'about') {
        aboutSection.classList.add('show');
        favoriteToolsSection.style.display = 'none';
        document.getElementById('tools').style.display = 'block';
        window.scrollTo({
          top: aboutSection.offsetTop - 20,
          behavior: 'smooth'
        });
      } else {
        aboutSection.classList.remove('show');
    favoriteToolsSection.style.display = 'none';
    document.getElementById('tools').style.display = 'block';
    currentCategory = 'all';
    displayTools(currentCategory);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 20,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Favorites link
document.getElementById('favorites-link').addEventListener('click', function(e) {
  e.preventDefault();
  showFavorites();
});

  // Display all tools initially
  displayTools(currentCategory);

  // Category filter functionality
  categoryButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      categoryButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
      
      const category = this.getAttribute('data-category');
      currentCategory = category;
      displayTools(category);
    });
  });

  attachFilterListeners();

  // Search on Enter key press
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchTools();
    }
  });

  // Initialize compare button
  document.getElementById('compareBtn').addEventListener('click', openComparisonModal);
}

function showFavorites() {
  aboutSection.classList.remove('show');
  document.getElementById('tools').style.display = 'none';
  favoriteToolsSection.style.display = 'block';
  currentCategory = 'favorites';
  displayFavorites();
  window.scrollTo({
    top: favoriteToolsSection.offsetTop - 20,
    behavior: 'smooth'
  });
}

// Search functionality
function searchTools() {
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm.trim() === '') return;
  
  loadingElement.classList.add('show');
  toolsGrid.innerHTML = '';
  
  // Simulate loading delay
  setTimeout(() => {
    let foundTools = [];
    
    // Search through all categories
    for (const category in aiToolsDatabase) {
      foundTools = foundTools.concat(
        aiToolsDatabase[category].filter(tool => 
          tool.name.toLowerCase().includes(searchTerm) || 
          tool.description.toLowerCase().includes(searchTerm) ||
          tool.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        )
      );
    }
    
    if (foundTools.length > 0) {
      renderTools(foundTools);
    } else {
      toolsGrid.innerHTML = `<p style="grid-column:1/-1;color:var(--secondary)">No tools found matching "${searchTerm}"</p>`;
    }
    
    loadingElement.classList.remove('show');
  }, 800);
}

function displayTools(category) {
  currentCategory = category;
  
  loadingElement.classList.add('show');
  toolsGrid.innerHTML = '';
  
  // Simulate loading delay
  setTimeout(() => {
    if (category === 'all') {
      // Combine all tools from all categories
      let allTools = [];
      for (const cat in aiToolsDatabase) {
        allTools = allTools.concat(aiToolsDatabase[cat]);
      }
      renderTools(applyFiltersAndSorting(allTools));
    } else {
      renderTools(applyFiltersAndSorting(aiToolsDatabase[category] || []));
    }
    
    loadingElement.classList.remove('show');
  }, 800);
}

// Render tools to the grid
function renderTools(tools) {
  if (tools.length === 0) {
    toolsGrid.innerHTML = '<p style="grid-column:1/-1;color:var(--secondary)">No tools found in this category</p>';
    return;
  }
  
  toolsGrid.innerHTML = tools.map(tool => {
    const isFavorite = favorites.includes(tool.name);
    const heartIcon = isFavorite ? '❤️' : '🤍';
    const heartColor = isFavorite ? '#ff4757' : '#ccc';
    
    return `
    <div class="tool-card" onclick='openToolModal(${JSON.stringify(tool)})'>
      <span class="icon">${tool.icon}</span>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tags">
        ${tool.tags.map(tag => `<span>${tag}</span>`).join('')}
      </div>
      <div class="footer">
        <span class="rating">${tool.rating}</span>
        <button onclick="event.stopPropagation(); addToCompare('${tool.name}')">Compare</button>
        <button onclick="event.stopPropagation(); toggleFavorite('${tool.name}')" style="color: ${heartColor}">${heartIcon}</button>
      </div>
    </div>
    `;
  }).join('');
}

function openToolModal(tool) {
  const modal = document.getElementById('toolModal');
  const details = document.getElementById('modalDetails');
  
  // Find similar tools (by shared tags)
  const allTools = [];
  for (const cat in aiToolsDatabase) allTools.push(...aiToolsDatabase[cat]);
  const similarTools = allTools.filter(t => 
    t.name !== tool.name && t.tags.some(tag => tool.tags.includes(tag))
  ).slice(0, 3);
  
  details.innerHTML = `
    <div class="modal-header">
      <h2>${tool.icon} ${tool.name}</h2>
      <p class="tool-description">${tool.description}</p>
    </div>
    <!-- Screenshots Section -->
    <div class="modal-section">
      <h3>📸 Screenshots & Demo</h3>
      <div class="screenshots-grid">
        <div class="screenshot-item">
          <img src="https://picsum.photos/600/300?random=${tool.name.length}" alt="${tool.name} Screenshot" loading="lazy" onclick="openImageViewer(this)">
          <p>Main Interface</p>
        </div>
        <div class="screenshot-item">
          <img src="https://picsum.photos/600/300?random=${tool.name.length + 10}" alt="UI Demo" loading="lazy" onclick="openImageViewer(this)">
          <p>UI Demo</p>
        </div>
        <div class="screenshot-item">
          <img src="https://picsum.photos/600/300?random=${tool.name.length + 20}" alt="Features Demo" loading="lazy" onclick="openImageViewer(this)">
          <p>Features Overview</p>
        </div>
      </div>
      <button class="demo-btn" onclick="openLiveDemo('${tool.name}', '${tool.url}')">
        🚀 Demo Options
      </button>
    </div>
    <!-- Pricing Section -->
    <div class="modal-section">
      <h3>💰 Pricing</h3>
      <div class="pricing-tiers">
        <div class="tier">
          <h4>${tool.price === 'free' ? 'Free Plan' : 'Pro Plan'}</h4>
          <p>${tool.price === 'free' ? 'Basic features included' : 'All premium features'}</p>
        </div>
        ${tool.price !== 'free' ? `
        <div class="tier">
          <h4>Free Tier</h4>
          <p>Limited functionality</p>
        </div>` : ''}
      </div>
    </div>
    <!-- Details Section -->
    <div class="modal-section">
      <h3>ℹ️ Details</h3>
      <div class="details-grid">
        <div><strong>Rating:</strong> ${tool.rating}</div>
        <div><strong>Release Date:</strong> ${tool.releaseDate}</div>
        <div><strong>Popularity:</strong> ${tool.popularityScore}/100</div>
        <div><strong>Category:</strong> ${tool.tags[0]}</div>
      </div>
    </div>
    <!-- Similar Tools -->
    ${similarTools.length > 0 ? `
    <div class="modal-section">
      <h3>🔍 Similar Tools</h3>
      <div class="similar-tools">
        ${similarTools.map(t => `
          <div class="similar-tool" onclick="openToolModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">
            <span>${t.icon}</span>
            <p>${t.name}</p>
          </div>
        `).join('')}
      </div>
    </div>` : ''}
    <!-- Actions -->
    <div class="modal-actions">
      <button class="visit-btn" onclick="window.open('${tool.url}', '_blank')">Visit Website</button>
      <button onclick="addToCompare('${tool.name}')">Add to Compare</button>
      <button onclick="toggleFavorite('${tool.name}')" style="color: ${favorites.includes(tool.name) ? '#ff4757' : '#ccc'}">
        ${favorites.includes(tool.name) ? '❤️ Remove Favorite' : '🤍 Add Favorite'}
      </button>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
  modal.style.display = 'block';
  
  // Close modal when clicking outside
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeToolModal();
  });
}

function closeToolModal() {
  document.getElementById('toolModal').style.display = 'none';
}

function applyFiltersAndSorting(tools) {
  const priceValue = document.getElementById('priceFilter')?.value;
  const ratingValue = document.getElementById('ratingFilter')?.value;
  const sortOption = document.getElementById('sortOptions')?.value;

  let filteredTools = tools;

  // Filter by price
  if (priceValue && priceValue !== 'all') {
    filteredTools = filteredTools.filter(tool =>
      tool.price?.trim().toLowerCase() === priceValue.trim().toLowerCase()
    );
  }

  // Filter by rating
  if (ratingValue && ratingValue !== 'all') {
    filteredTools = filteredTools.filter(tool => tool.rating === ratingValue);
  }

  // Sort logic
  switch (sortOption) {
    case 'name':
      filteredTools.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      filteredTools.sort((a, b) => b.rating.length - a.rating.length);
      break;
    case 'newest':
      filteredTools.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
      break;
    case 'popular':
      filteredTools.sort((a, b) => b.popularityScore - a.popularityScore);
      break;
  }

  return filteredTools;
}

// Attach change listeners
function attachFilterListeners() {
  const filters = ['priceFilter', 'ratingFilter', 'sortOptions'];
  filters.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => displayTools(currentCategory));
    }
  });
}

function addToCompare(toolName) {
  if (!compareList.includes(toolName)) {
    compareList.push(toolName);
    alert(`${toolName} added to comparison.`);
  } else {
    alert(`${toolName} is already in comparison list.`);
  }
}

function toggleFavorite(toolName) {
  const index = favorites.indexOf(toolName);
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(toolName);
  }
  
  // Save to localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Update current view
  if (currentCategory === 'favorites') {
    displayFavorites();
  } else {
    // Update the current tools display to refresh heart icons
    displayTools(currentCategory);
  }

  
  // Single save to localStorage
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  // Update UI
  updateFavoriteButton(toolName);
  
  // Only refresh favorites view if we're on that page
  if (currentCategory === 'favorites' || window.location.hash === '#favorites') {
    displayFavorites();
  }
}

function updateFavoriteButton(toolName) {
  const toolCards = document.querySelectorAll('.tool-card');
  toolCards.forEach(card => {
    const cardTitle = card.querySelector('h3').textContent;
    if (cardTitle === toolName) {
      const favoriteBtn = card.querySelector('.footer button:last-child');
      if (favorites.includes(toolName)) {
        favoriteBtn.innerHTML = '❤️';
        favoriteBtn.style.color = '#ff4757';
      } else {
        favoriteBtn.innerHTML = '🤍';
        favoriteBtn.style.color = '#ccc';
      }
    }
  });
}

function displayFavorites() {
  if (!favoritesGrid) {
    favoritesGrid = document.getElementById('favoritesGrid');
  }
  
  loadingElement.classList.add('show');
  
  setTimeout(() => {
    if (favorites.length === 0) {
      favoritesGrid.innerHTML = '<p style="grid-column:1/-1;color:var(--secondary);text-align:center;padding:2rem">No favorite tools yet. Click the heart icon on any tool to add it to favorites!</p>';
      loadingElement.classList.remove('show');
      return;
    }
    
    // Get all tools from all categories
    let allTools = [];
    for (const category in aiToolsDatabase) {
      allTools = allTools.concat(aiToolsDatabase[category]);
    }
    
    // Filter only favorite tools
    const favoriteTools = allTools.filter(tool => 
      favorites.includes(tool.name)
    );
    
    if (favoriteTools.length > 0) {
      favoritesGrid.innerHTML = favoriteTools.map(tool => createToolCard(tool)).join('');
    } else {
      favoritesGrid.innerHTML = '<p style="grid-column:1/-1;color:var(--secondary);text-align:center;padding:2rem">Some favorite tools may no longer be available.</p>';
    }
    
    loadingElement.classList.remove('show');
  }, 500);
}

function openComparisonModal() {
  const modal = document.getElementById('comparisonModal');
  modal.style.display = 'block';
  renderComparison();
}

function closeComparisonModal() {
  document.getElementById('comparisonModal').style.display = 'none';
}

function renderComparison() {
  const allTools = [];
  for (const cat in aiToolsDatabase) {
    allTools.push(...aiToolsDatabase[cat]);
  }
  
  const selectedTools = allTools.filter(tool => compareList.includes(tool.name));
  
  if (selectedTools.length === 0) {
    document.getElementById('comparisonContent').innerHTML = 
      '<p style="text-align:center;color:var(--secondary)">No tools selected for comparison.</p>';
    return;
  }

  // Create comparison table
  let html = `
    <div class="comparison-table">
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            ${selectedTools.map(tool => `<th>${tool.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Description</td>
            ${selectedTools.map(tool => `<td>${tool.description}</td>`).join('')}
          </tr>
          <tr>
            <td>Rating</td>
            ${selectedTools.map(tool => `<td>${tool.rating}</td>`).join('')}
          </tr>
          <tr>
            <td>Price</td>
            ${selectedTools.map(tool => `<td>${tool.price}</td>`).join('')}
          </tr>
          <tr>
            <td>Tags</td>
            ${selectedTools.map(tool => `<td>${tool.tags.join(', ')}</td>`).join('')}
          </tr>
          <tr>
            <td>Popularity</td>
            ${selectedTools.map(tool => `<td>${tool.popularityScore}/100</td>`).join('')}
          </tr>
          <tr>
            <td>Release Date</td>
            ${selectedTools.map(tool => `<td>${tool.releaseDate}</td>`).join('')}
          </tr>
          <tr>
            <td>Visit</td>
            ${selectedTools.map(tool => `<td><button onclick="window.open('${tool.url}', '_blank')">Visit</button></td>`).join('')}
          </tr>
        </tbody>
      </table>
    </div>
    <button onclick="closeComparisonModal()" class="close-comparison">Close</button>
  `;

  document.getElementById('comparisonContent').innerHTML = html;
}

// Initialize the app when DOM is loaded

// Function to handle the "Try Live Demo" button
function openLiveDemo(toolName, toolUrl) {
  const matchedUrl = demoUrls[toolName] || toolUrl;

  if (matchedUrl) {
    window.open(matchedUrl, '_blank', 'noopener,noreferrer');
  } else {
    alert(`Demo for ${toolName} is not available yet.`);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);

document.getElementById('back-to-main')?.addEventListener('click', () => {
  favoriteToolsSection.style.display = 'none';
  aboutSection.classList.remove('show');
  document.getElementById('tools').style.display = 'block';
  currentCategory = 'all';
  displayTools(currentCategory);
});



// Replace the existing openLiveDemo function with this:
function openLiveDemo(toolName, toolUrl) {
  const matchedUrl = demoUrls[toolName] || toolUrl;
  
  if (!matchedUrl) {
    // If no demo URL, show the demo options modal instead
    showDemo(toolName);
    return;
  }

  // Check if this is a YouTube link
  if (matchedUrl.includes('youtube.com') || matchedUrl.includes('youtu.be')) {
    showVideoDemo(toolName);
    return;
  }

  // Open external demos in a new tab with a warning
  const shouldSandbox = confirm(`Open ${toolName} in a new tab?\n\nFor security reasons, we can't embed external websites directly.`);
  
  if (shouldSandbox) {
    window.open(matchedUrl, '_blank', 'noopener,noreferrer');
  } else {
    // If user cancels, show the preview instead
    showPreviewDemo(toolName);
  }
}


// Replace the existing showPreviewDemo with this:
function showPreviewDemo(toolName) {
  closeDemoModal();
  const tool = findToolByName(toolName);
  
  const previewModal = document.createElement('div');
  previewModal.className = 'modal';
  previewModal.style.display = 'block';
  
  previewModal.innerHTML = `
    <div class="modal-content large-modal">
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3>${toolName} Preview</h3>
      <div class="preview-content">
        <div class="preview-screenshots">
          <img src="https://source.unsplash.com/random/600x300/?${encodeURIComponent(toolName)},tech" alt="${toolName} Screenshot" onclick="openImageViewer(this)">
          <img src="https://source.unsplash.com/random/600x300/?${encodeURIComponent(toolName)},interface" alt="${toolName} Interface" onclick="openImageViewer(this)">
        </div>
        <div class="preview-description">
          <h4>About ${toolName}</h4>
          <p>${tool?.description || 'No description available'}</p>
          
          <div class="preview-features">
            <h4>Key Features:</h4>
            <ul>
              <li>${generatePreviewContent(toolName)}</li>
              <li>Intuitive user interface</li>
              <li>Powerful AI capabilities</li>
            </ul>
          </div>
          
          <div class="preview-actions">
            <button onclick="openLiveDemo('${toolName}', '${tool?.url || ''}')">
              Visit Official Site
            </button>
            ${videoDemos[toolName] ? `
            <button onclick="showVideoDemo('${toolName}')">
              Watch Video Demo
            </button>` : ''}
          </div>
        </div>
      </div>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
  
  document.body.appendChild(previewModal);
  
  previewModal.addEventListener('click', function(e) {
    if (e.target === previewModal) {
      previewModal.remove();
    }
  });
}



// Placeholder for preview (can be enhanced later)


// Close modal
function closeDemoModal() {
  const modal = document.getElementById("demoModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Ensure global access
window.openLiveDemo = openLiveDemo;
window.showDemo = showDemo;
window.showPreviewDemo = showPreviewDemo;
window.closeDemoModal = closeDemoModal;
window.showVideoDemo = showVideoDemo;
window.openImageViewer = openImageViewer;
window.closeImageViewer = closeImageViewer;

// Updated showVideoDemo function using YouTube API
async function showVideoDemo(toolName) {
  closeDemoModal();
  
  if (!videoQueries[toolName]) {
    alert(`No video available for ${toolName}`);
    return;
  }

  // Show loading modal immediately
  const videoModal = document.createElement('div');
  videoModal.className = 'modal';
  videoModal.style.display = 'block';
  videoModal.innerHTML = `
    <div class="modal-content video-modal">
      <span class="close-btn" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h3>${toolName} Video Demo</h3>
      <div class="video-loading">
        <p>Loading video...</p>
      </div>
      <div class="video-container" style="display:none;"></div>
      <div class="video-fallback" style="display:none;">
        <p>Couldn't load video. <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(videoQueries[toolName])}" target="_blank">Search on YouTube</a></p>
      </div>
    
    <section class="reviews-section">
      <h2>User Reviews</h2>
      <div class="reviews-container" id="reviews-${tool.name.replace(/\s+/g, '-')}">
        <!-- Reviews will load here automatically -->
      </div>

      <div class="add-review">
        <h3>Write a Review</h3>
        <form class="review-form" id="reviewForm-${tool.name.replace(/\s+/g, '-')}">
          <div class="rating-input">
            <label>Your Rating:</label>
            <div class="star-rating">
              ${[1, 2, 3, 4, 5].map(star => `
                <input type="radio" id="rate-${tool.name.replace(/\s+/g, '-')}-${star}" name="rating" value="${star}">
                <label for="rate-${tool.name.replace(/\s+/g, '-')}-${star}">★</label>
              `).join('')}
            </div>
          </div>
          <div class="form-group">
            <label for="review-text-${tool.name.replace(/\s+/g, '-')}">Your Review:</label>
            <textarea id="review-text-${tool.name.replace(/\s+/g, '-')}" name="review" required></textarea>
          </div>
          <div class="form-group">
            <label style="display:block; margin-top:10px;" for="reviewer-name-${tool.name.replace(/\s+/g, '-')}">Your Name (optional):</label>
            <input type="text" id="reviewer-name-${tool.name.replace(/\s+/g, '-')}" name="name">
          </div>
          <button type="submit" class="submit-review">Submit Review</button>
        </form>
      </div>
    </section>
</div>
  `;
  document.body.appendChild(videoModal);

  try {
    // Load YouTube API if not already loaded
    await loadYouTubeAPI();
    
    if (!gapiLoaded) {
      throw new Error('YouTube API failed to load');
    }

    // Search for videos using the API
    const response = await gapi.client.youtube.search.list({
      part: 'snippet',
      q: videoQueries[toolName],
      type: 'video',
      maxResults: 1,
      order: 'relevance'
    });

    const videos = response.result.items;
    
    if (videos && videos.length > 0) {
      const videoId = videos[0].id.videoId;
      const container = videoModal.querySelector('.video-container');
      container.innerHTML = `
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; 
                encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      `;
      videoModal.querySelector('.video-loading').style.display = 'none';
      container.style.display = 'block';
    } else {
      throw new Error('No videos found');
    }
  } catch (error) {
    console.error('Error loading video:', error);
    videoModal.querySelector('.video-loading').style.display = 'none';
    videoModal.querySelector('.video-fallback').style.display = 'block';
  }

  // Close handlers
  videoModal.addEventListener('click', function(e) {
    if (e.target === videoModal) {
      videoModal.remove();
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      videoModal.remove();
    }
  });
}



const videoDemos = {
  "ChatGPT": "https://www.youtube.com/embed/JTxsNm9IdYU",
  "Jasper AI": "https://www.youtube.com/embed/loRJkgeRgt4",
  "Copy.ai": "https://www.youtube.com/embed/9EfoYaa_iLY",
  "DALL\u2011E 3": "https://www.youtube.com/embed/sqQrN0iZBs0",
  "Midjourney": "https://www.youtube.com/embed/90tXPbyRGS8",
  "Stable Diffusion": "https://www.youtube.com/embed/dMkiOex_cKU",
  "GitHub Copilot": "https://www.youtube.com/embed/ZapdeEJ7xJw",
  "Claude Code": "https://www.youtube.com/embed/z37_rONQof8",
  "Tabnine": "https://www.youtube.com/embed/Fi3AJZZregI",
  "HubSpot AI": "https://www.youtube.com/embed/UNKNOWN_HUBSPOT_VIDEO",
  "Semrush": "https://www.youtube.com/embed/OURYGblJzac",
  "Buffer AI": "https://www.youtube.com/embed/8ImwfQ1WeKI",
  "Khan Academy AI": "https://www.youtube.com/embed/rnIgnS8Susg",
  "Duolingo": "https://www.youtube.com/embed/Jtz_kHkBwVc",
  "Coursera AI": "https://www.youtube.com/embed/HFWcgN_RD1w",
  "Runway ML": "https://www.youtube.com/embed/jp2iLYH_dOY",
  "Pictory": "https://www.youtube.com/embed/heHnYt6XKTk",
  "Loom AI": "https://www.youtube.com/embed/apqd3aEMnuY",
  "AIVA": "https://www.youtube.com/embed/HmSGKhW26TI",
  "Mubert": "https://www.youtube.com/embed/1WX_Gz_Vm4s",
  "Descript": "https://www.youtube.com/embed/RgwJNOXGARI",
  "Zapier": "https://www.youtube.com/embed/7JXEkHBELrE",
  "UiPath": "https://www.youtube.com/embed/I3W66xHjr_w",
  "Monday.ai": "https://www.youtube.com/embed/y84T3lCAbZ0",
  "Tableau AI": "https://www.youtube.com/embed/oLysN4HI8hs",
  "DataRobot": "https://www.youtube.com/embed/Yb-h_GZZ1yI",
  "H2O.ai": "https://www.youtube.com/embed/wcyMBRRLmqs",
  "Figma AI": "https://www.youtube.com/embed/qJoGFDHjLSE",
  "Notion AI": "https://www.youtube.com/embed/SnbMRRZ2_Ag",
  "Otter.ai": "https://www.youtube.com/embed/fIOvCAf8AKQ",
  "Fireflies.ai": "https://www.youtube.com/embed/wGKpEJkyKP0",
  "Darktrace": "https://www.youtube.com/embed/t3yRs-Wf_Dk",
  "Ada": "https://www.youtube.com/embed/kwx7IZhrF8k",
  "Adobe Sensei": "https://www.youtube.com/embed/XcdwBOBJLUQ",
  "AlphaSense": "https://www.youtube.com/embed/QPMfWLwv23I",
  "Ayasdi": "https://www.youtube.com/embed/UZH5xJXJG2I",
  "Butterfly Network": "https://www.youtube.com/embed/181PAbDjpOw",
  "Canva AI": "https://www.youtube.com/embed/ytaKk0nOFJ0",
  "Cherre": "https://www.youtube.com/embed/n1w0xRVy6dk",
  "DeepL": "https://www.youtube.com/embed/mtXM2vEtlg0",
  "Drift": "https://www.youtube.com/embed/0hiXGwAw5zo",
  "Elicit": "https://www.youtube.com/embed/rJJPS-EvNfk",
  "Google Translate AI": "https://www.youtube.com/embed/sIoHFPGOY0I",
  "Hootsuite AI": "https://www.youtube.com/embed/PnUAdpjnnpY",
  "IBM Watson Health": "https://www.youtube.com/embed/U6rvaWaiZNg",
  "Intercom Fin": "https://www.youtube.com/embed/yzdzJF4KcVo",
  "Inworld AI": "https://www.youtube.com/embed/Aev65jeXozY",
  "Kensho": "https://www.youtube.com/embed/QPMfWLwv23I",
  "Plaid": "https://www.youtube.com/embed/EvQO2r6C-rM",
  "Predis.ai": "https://www.youtube.com/embed/jwNf75aj5vo",
  "Restb.ai": "https://www.youtube.com/embed/oWK-hSvM8oI",
  "Scite AI": "https://www.youtube.com/embed/j3OLVBLp6sc",
  "Skyline AI": "https://www.youtube.com/embed/DUpVoTcsnus",
  "Sonix": "https://www.youtube.com/embed/9sPJ9szix8Y",
  "Tempus": "https://www.youtube.com/embed/I4pPEsMUuLo",
  "Tidio Lyro": "https://www.youtube.com/embed/opVK328AEWg",
  "Unity ML-Agents": "https://www.youtube.com/embed/Dhr4tHY3joE",
  "Vectra AI": "https://www.youtube.com/embed/q2dR69D1kCo",
  "Zebra Medical Vision": "https://www.youtube.com/embed/FcwAjWmFq4c"
};






function initializeReviewSystem() {
  document.querySelectorAll('.review-form').forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const tool = this.id.replace('reviewForm-', '');
      const rating = this.querySelector('input[name="rating"]:checked')?.value || "";
      const reviewText = this.querySelector('textarea[name="review"]').value;
      const name = this.querySelector('input[name="name"]').value || "Anonymous";

      const response = await fetch("http://localhost:5000/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, rating, reviewText, name, date: new Date().toISOString() })
      });

      if (response.ok) {
        this.reset();
        loadReviews(tool);
      }
    });
  });

  document.querySelectorAll(".reviews-container").forEach(container => {
    const tool = container.id.replace("reviews-", "");
    loadReviews(tool);
  });
}

async function loadReviews(tool) {
  const response = await fetch(`http://localhost:5000/api/reviews/${tool}`);
  const reviews = await response.json();
  const container = document.getElementById("reviews-" + tool);
  if (!container) return;

  container.innerHTML = reviews.map(r => `
    <div class="review">
      <div class="review-rating">Rating: ${r.rating} ★</div>
      <div class="review-text">${r.reviewText}</div>
      <div class="review-name">– ${r.name}</div>
      <div class="review-date">${new Date(r.date).toLocaleString()}</div>
    </div>
  `).join("");
}



function updateToolReviewCounts() {
  document.querySelectorAll(".tool-card").forEach(async card => {
    const toolName = card.getAttribute("data-tool-name");
    if (!toolName) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${toolName}`);
      const reviews = await response.json();
      const count = reviews.length;

      let countEl = card.querySelector(".review-count");
      if (!countEl) {
        countEl = document.createElement("div");
        countEl.className = "review-count";
        countEl.style = "color:#ffd700;font-size:12px;margin-top:6px;";
        card.appendChild(countEl);
      }

      countEl.textContent = `★ ${count} Review${count !== 1 ? "s" : ""}`;
    } catch (err) {
      console.error("Failed to fetch review count for", toolName, err);
    }
  });
}

window.addEventListener("load", updateToolReviewCounts);