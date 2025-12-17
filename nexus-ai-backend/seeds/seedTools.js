// ============================================
// SEED AI TOOLS DATA
// Run: node seeds/seedTools.js
// ============================================

const path = require('path');

// Load environment variables from the root directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Tool = require('../models/Tool');
const User = require('../models/User');

// Debug: Verify environment variables are loaded
console.log('🔍 Environment Debug:');
console.log('   Current directory:', process.cwd());
console.log('   .env path:', path.join(__dirname, '../.env'));
console.log('   MONGODB_URI loaded:', !!process.env.MONGODB_URI);
console.log('   NODE_ENV:', process.env.NODE_ENV);

if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not defined in environment variables');
    console.error('💡 Make sure you have a .env file in the root directory with MONGODB_URI');
    console.error('💡 Check the file exists at:', path.join(__dirname, '../.env'));
    process.exit(1);
}

const tools = [
    {
        name: "ChatGPT",
        description: "Advanced conversational AI that can understand and respond to natural language queries, help with writing, coding, analysis, and creative tasks.",
        website: "https://chat.openai.com",
        logo: "https://via.placeholder.com/100/00A67E/fff?text=ChatGPT",
        category: "AI Chatbot",
        tags: ["chatbot", "conversation", "writing", "coding"],
        features: ["Natural conversations", "Code generation", "Creative writing", "Question answering", "Task assistance"],
        pricing: { type: "Freemium", startingPrice: 20, currency: "USD" }
    },
    {
        name: "Midjourney",
        description: "AI art generator that creates stunning, high-quality images from text descriptions. Perfect for artists, designers, and creative professionals.",
        website: "https://midjourney.com",
        logo: "https://via.placeholder.com/100/000000/fff?text=MJ",
        category: "AI Image Generation",
        tags: ["art", "images", "creative", "design"],
        features: ["Text-to-image", "High resolution", "Various styles", "Community gallery", "Custom parameters"],
        pricing: { type: "Paid", startingPrice: 10, currency: "USD" }
    },
    {
        name: "GitHub Copilot",
        description: "AI pair programmer that suggests code and entire functions in real-time from your editor. Trained on billions of lines of code.",
        website: "https://github.com/features/copilot",
        logo: "https://via.placeholder.com/100/0366D6/fff?text=Copilot",
        category: "AI Coding",
        tags: ["coding", "programming", "development", "autocomplete"],
        features: ["Code suggestions", "Multi-language support", "Context-aware", "Function generation", "Documentation"],
        pricing: { type: "Paid", startingPrice: 10, currency: "USD" }
    },
    {
        name: "DALL-E 3",
        description: "Create realistic images and art from text descriptions. Latest version with improved accuracy and understanding of prompts.",
        website: "https://openai.com/dall-e-3",
        logo: "https://via.placeholder.com/100/FF6B6B/fff?text=DALLE",
        category: "AI Image Generation",
        tags: ["images", "art", "creative", "generation"],
        features: ["High quality images", "Prompt understanding", "Style variations", "Safe content", "Commercial use"],
        pricing: { type: "Freemium", startingPrice: 15, currency: "USD" }
    },
    {
        name: "Grammarly",
        description: "AI writing assistant that helps you write clear, mistake-free content. Checks grammar, spelling, punctuation, and style.",
        website: "https://grammarly.com",
        logo: "https://via.placeholder.com/100/15C39A/fff?text=G",
        category: "AI Writing",
        tags: ["writing", "grammar", "editing", "proofreading"],
        features: ["Grammar checking", "Style suggestions", "Plagiarism detection", "Tone analysis", "Browser extension"],
        pricing: { type: "Freemium", startingPrice: 12, currency: "USD" }
    },
    {
        name: "Jasper AI",
        description: "AI content platform for creating blog posts, social media content, marketing copy, and more. Used by thousands of marketers.",
        website: "https://jasper.ai",
        logo: "https://via.placeholder.com/100/8B5CF6/fff?text=Jasper",
        category: "AI Writing",
        tags: ["content", "marketing", "copywriting", "seo"],
        features: ["Content templates", "SEO optimization", "Brand voice", "Multi-language", "Team collaboration"],
        pricing: { type: "Paid", startingPrice: 39, currency: "USD" }
    },
    {
        name: "Runway ML",
        description: "AI-powered video editing suite with tools for motion tracking, green screen, and generating video from text prompts.",
        website: "https://runwayml.com",
        logo: "https://via.placeholder.com/100/3B82F6/fff?text=Runway",
        category: "AI Video",
        tags: ["video", "editing", "effects", "generation"],
        features: ["Text-to-video", "Video editing", "Green screen", "Motion tracking", "AI effects"],
        pricing: { type: "Freemium", startingPrice: 15, currency: "USD" }
    },
    {
        name: "ElevenLabs",
        description: "AI voice generator with the most realistic and versatile voices. Create natural-sounding speech in multiple languages.",
        website: "https://elevenlabs.io",
        logo: "https://via.placeholder.com/100/EC4899/fff?text=11Labs",
        category: "AI Voice",
        tags: ["voice", "speech", "audio", "tts"],
        features: ["Voice cloning", "Multi-language", "Emotion control", "High quality", "API access"],
        pricing: { type: "Freemium", startingPrice: 5, currency: "USD" }
    },
    {
        name: "Copy.ai",
        description: "AI-powered copywriting tool that helps you create marketing copy, product descriptions, and social media posts in seconds.",
        website: "https://copy.ai",
        logo: "https://via.placeholder.com/100/F59E0B/fff?text=Copy",
        category: "AI Writing",
        tags: ["copywriting", "marketing", "content", "social"],
        features: ["90+ tools", "Templates", "Multi-language", "Tone control", "Team workspace"],
        pricing: { type: "Freemium", startingPrice: 36, currency: "USD" }
    },
    {
        name: "Stable Diffusion",
        description: "Open-source AI image generation model. Create detailed images from text descriptions with full control over the process.",
        website: "https://stability.ai",
        logo: "https://via.placeholder.com/100/10B981/fff?text=SD",
        category: "AI Image Generation",
        tags: ["open-source", "images", "generation", "free"],
        features: ["Open source", "Self-hostable", "High quality", "Custom models", "Full control"],
        pricing: { type: "Open Source", startingPrice: 0, currency: "USD" }
    },
    {
        name: "Notion AI",
        description: "AI writing assistant built into Notion. Helps you write, brainstorm, edit, and summarize content directly in your workspace.",
        website: "https://notion.so/product/ai",
        logo: "https://via.placeholder.com/100/000000/fff?text=Notion",
        category: "AI Writing",
        tags: ["productivity", "writing", "notes", "workspace"],
        features: ["In-app AI", "Content generation", "Summarization", "Translation", "Editing"],
        pricing: { type: "Freemium", startingPrice: 10, currency: "USD" }
    },
    {
        name: "Claude AI",
        description: "Constitutional AI assistant by Anthropic. Helpful, harmless, and honest AI for conversations, analysis, and content creation.",
        website: "https://claude.ai",
        logo: "https://via.placeholder.com/100/D97706/fff?text=Claude",
        category: "AI Chatbot",
        tags: ["chatbot", "assistant", "safe", "analysis"],
        features: ["Long conversations", "Document analysis", "Safe responses", "Coding help", "Research"],
        pricing: { type: "Freemium", startingPrice: 20, currency: "USD" }
    },
    {
        name: "Synthesia",
        description: "AI video generation platform. Create professional videos with AI avatars from text scripts without filming or editing.",
        website: "https://synthesia.io",
        logo: "https://via.placeholder.com/100/6366F1/fff?text=Syn",
        category: "AI Video",
        tags: ["video", "avatar", "presentation", "training"],
        features: ["AI avatars", "140+ languages", "Templates", "Screen recording", "Brand kit"],
        pricing: { type: "Paid", startingPrice: 30, currency: "USD" }
    },
    {
        name: "Canva AI",
        description: "Design platform with AI tools for image generation, background removal, and design suggestions. Perfect for non-designers.",
        website: "https://canva.com",
        logo: "https://via.placeholder.com/100/00C4CC/fff?text=Canva",
        category: "AI Design",
        tags: ["design", "graphics", "templates", "creative"],
        features: ["Magic design", "Background removal", "Text-to-image", "Templates", "Collaboration"],
        pricing: { type: "Freemium", startingPrice: 12.99, currency: "USD" }
    },
    {
        name: "Perplexity AI",
        description: "AI-powered search engine that provides accurate answers with citations. Combines search with conversational AI.",
        website: "https://perplexity.ai",
        logo: "https://via.placeholder.com/100/1E40AF/fff?text=Perp",
        category: "AI Analytics",
        tags: ["search", "research", "answers", "citations"],
        features: ["Real-time search", "Citations", "Follow-up questions", "Source links", "Mobile app"],
        pricing: { type: "Freemium", startingPrice: 20, currency: "USD" }
    },
    {
        name: "Midjourney V6",
        description: "Latest version of Midjourney with enhanced realism, better prompt understanding, and improved text rendering.",
        website: "https://midjourney.com",
        logo: "https://via.placeholder.com/100/DC2626/fff?text=MJv6",
        category: "AI Image Generation",
        tags: ["art", "realistic", "advanced", "creative"],
        features: ["Photorealistic", "Text rendering", "Improved prompts", "Higher resolution", "Better anatomy"],
        pricing: { type: "Paid", startingPrice: 10, currency: "USD" }
    },
    {
        name: "Descript",
        description: "All-in-one video and podcast editing with AI transcription, voice cloning, and filler word removal.",
        website: "https://descript.com",
        logo: "https://via.placeholder.com/100/7C3AED/fff?text=Desc",
        category: "AI Video",
        tags: ["video", "podcast", "editing", "transcription"],
        features: ["Text-based editing", "Overdub", "Screen recording", "Transcription", "Collaboration"],
        pricing: { type: "Freemium", startingPrice: 12, currency: "USD" }
    },
    {
        name: "Otter.ai",
        description: "AI meeting assistant that records audio, writes notes, and generates summaries automatically.",
        website: "https://otter.ai",
        logo: "https://via.placeholder.com/100/0EA5E9/fff?text=Otter",
        category: "AI Analytics",
        tags: ["transcription", "meetings", "notes", "productivity"],
        features: ["Real-time transcription", "Meeting summaries", "Action items", "Speaker ID", "Integration"],
        pricing: { type: "Freemium", startingPrice: 8.33, currency: "USD" }
    },
    {
        name: "Murf AI",
        description: "AI voice generator for creating studio-quality voiceovers. Perfect for presentations, videos, and audiobooks.",
        website: "https://murf.ai",
        logo: "https://via.placeholder.com/100/F97316/fff?text=Murf",
        category: "AI Voice",
        tags: ["voice", "voiceover", "audio", "tts"],
        features: ["120+ voices", "20+ languages", "Pitch control", "Emphasis", "Commercial use"],
        pricing: { type: "Freemium", startingPrice: 19, currency: "USD" }
    },
    {
        name: "Writesonic",
        description: "AI writing platform for creating SEO-optimized content, blog posts, ads, and landing pages quickly.",
        website: "https://writesonic.com",
        logo: "https://via.placeholder.com/100/8B5CF6/fff?text=WS",
        category: "AI Writing",
        tags: ["content", "seo", "blog", "marketing"],
        features: ["Article writer", "SEO optimizer", "Paraphraser", "AI templates", "Bulk generation"],
        pricing: { type: "Freemium", startingPrice: 16, currency: "USD" }
    }
];

async function seedTools() {
    try {
        console.log('🚀 Starting tool seeding process...');
        
        // Connect to MongoDB
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
        console.log('   Database:', mongoose.connection.name);
        console.log('   Host:', mongoose.connection.host);

        // Find or create admin user
        console.log('👤 Checking admin user...');
        let adminUser = await User.findOne({ email: 'admin@nexusai.com' });
        
        if (!adminUser) {
            console.log('   Admin user not found, creating one...');
            adminUser = await User.create({
                name: 'Admin',
                email: 'admin@nexusai.com',
                password: process.env.ADMIN_PASSWORD || 'Admin@123456',
                role: 'admin',
                isVerified: true
            });
            console.log('✅ Admin user created');
        } else {
            console.log('✅ Admin user found');
        }

        // Clear existing tools (optional)
        console.log('🗑️  Clearing existing tools...');
        await Tool.deleteMany({});
        console.log('✅ Cleared existing tools');

        // Add createdBy field to all tools
        const toolsWithCreator = tools.map(tool => ({
            ...tool,
            createdBy: adminUser._id,
            isActive: true,
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        // Insert tools
        console.log(`📥 Inserting ${tools.length} tools...`);
        const insertedTools = await Tool.insertMany(toolsWithCreator);
        console.log(`✅ Successfully inserted ${insertedTools.length} tools`);

        // Display summary
        console.log('\n📊 SEED SUMMARY:');
        console.log(`Total Tools: ${insertedTools.length}`);
        
        const categoryCounts = {};
        insertedTools.forEach(tool => {
            categoryCounts[tool.category] = (categoryCounts[tool.category] || 0) + 1;
        });
        
        console.log('\n📂 By Category:');
        Object.entries(categoryCounts).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} tools`);
        });

        console.log('\n🎉 Seeding complete!');
        console.log('📋 Summary:');
        console.log(`   - ${insertedTools.length} AI tools added`);
        console.log(`   - ${Object.keys(categoryCounts).length} categories`);
        console.log(`   - Created by: ${adminUser.name} (${adminUser.email})`);
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding tools:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        if (error.code === 'ENOTFOUND') {
            console.error('💡 Connection failed. Check your MONGODB_URI and internet connection.');
        } else if (error.code === 'EAUTH') {
            console.error('💡 Authentication failed. Check your MongoDB credentials.');
        }
        console.error('   Stack:', error.stack);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:');
    console.error(error);
    process.exit(1);
});

seedTools();