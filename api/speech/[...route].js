const { connectToDatabase } = require('../lib/mongodb');
const { verifyAuth } = require('../lib/auth');

// Initialize OpenAI if API key is available
let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    const OpenAI = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (error) {
  console.log('OpenAI not available');
}

// Speech topics
const topics = [
  { id: 1, name: 'Technology', icon: '💻', description: 'Discuss the impact of technology on modern life' },
  { id: 2, name: 'Environment', icon: '🌍', description: 'Talk about environmental issues and solutions' },
  { id: 3, name: 'Education', icon: '📚', description: 'Share thoughts on education and learning' },
  { id: 4, name: 'Health', icon: '🏥', description: 'Discuss health and wellness topics' },
  { id: 5, name: 'Travel', icon: '✈️', description: 'Share travel experiences and adventures' },
  { id: 6, name: 'Culture', icon: '🎭', description: 'Explore cultural diversity and traditions' },
  { id: 7, name: 'Sports', icon: '⚽', description: 'Talk about sports and fitness' },
  { id: 8, name: 'Business', icon: '💼', description: 'Discuss business and entrepreneurship' },
  { id: 9, name: 'Science', icon: '🔬', description: 'Explore scientific discoveries and innovations' },
  { id: 10, name: 'Art', icon: '🎨', description: 'Discuss art, music, and creativity' }
];

// Default speeches for fallback
const defaultSpeeches = {
  '2-minute': `Technology has transformed the way we live, work, and communicate with each other. In today's digital age, smartphones, computers, and the internet have become essential parts of our daily lives. We use technology for everything from staying connected with friends and family to managing our finances and accessing information. The rapid advancement of technology has brought numerous benefits to society. It has made communication faster and more efficient, allowing us to connect with people across the globe in seconds. Education has become more accessible through online learning platforms, and healthcare has improved with the development of advanced medical equipment and telemedicine. However, technology also presents challenges. Privacy concerns, cybersecurity threats, and the digital divide are issues we must address. As we continue to embrace new technologies, it is crucial that we use them responsibly and ensure that their benefits are shared by everyone in society.`,
  '5-minute': `Technology has fundamentally changed every aspect of human existence in the modern world. From the moment we wake up to the time we go to sleep, we interact with various technological devices and systems that make our lives more convenient, efficient, and connected than ever before. The evolution of technology over the past few decades has been nothing short of remarkable. We have witnessed the rise of personal computers, the birth of the internet, the smartphone revolution, and now we are entering an era of artificial intelligence and machine learning. Each of these developments has brought significant changes to how we live, work, and interact with one another. One of the most significant impacts of technology has been on communication. In the past, staying in touch with someone in another country meant writing letters that would take weeks to arrive or making expensive long-distance phone calls. Today, we can video chat with anyone in the world for free, share photos and updates instantly on social media, and collaborate on projects with team members across different continents in real-time. Education has also been transformed by technology. Students no longer need to rely solely on textbooks and classroom lectures. They can access vast libraries of information online, watch educational videos, take online courses from prestigious universities, and use interactive learning tools that make studying more engaging. This democratization of education has opened up opportunities for people who might not have had access to quality education before. In the healthcare sector, technology has enabled doctors to diagnose diseases more accurately, perform complex surgeries with greater precision, and develop new treatments at a faster pace. Telemedicine has made healthcare more accessible, especially for people in remote areas who previously had to travel long distances to see a doctor. However, we must also acknowledge the challenges that come with our increasing reliance on technology. Privacy has become a major concern as companies collect vast amounts of personal data. Cybersecurity threats are constantly evolving, putting individuals and organizations at risk. The digital divide means that not everyone has equal access to technology, creating inequalities in education and economic opportunities. As we move forward, it is essential that we approach technology with both optimism and caution. We must work together to ensure that technological advancements benefit all of humanity while minimizing the negative impacts on society and the environment.`,
  '10-minute': `Technology has become the defining force of our age, reshaping virtually every aspect of human existence in ways both profound and subtle. From the moment we wake to the sound of a smartphone alarm to the time we fall asleep watching streaming content, technology mediates our experience of the world. Understanding this technological transformation, its benefits, its risks, and its implications for the future is essential for anyone seeking to thrive in the twenty-first century. The pace of technological change has accelerated dramatically over the past few decades. Computing power has doubled roughly every two years, following the pattern known as Moore's Law, enabling devices to become smaller, faster, and cheaper. The internet has grown from a network connecting a few thousand computers to a global system linking billions of devices and users. Mobile technology has put powerful computers in the pockets of people around the world. These changes have occurred so quickly that society is still adapting to their implications. Communication has been transformed perhaps more than any other aspect of life. Throughout most of human history, communication over distance was slow and expensive. Letters took weeks to cross oceans, and long-distance phone calls were luxuries. Today, we can instantly video chat with anyone in the world for free, share our thoughts with millions on social media, and collaborate in real-time with colleagues on different continents. This revolution in communication has connected humanity as never before, though it has also created new challenges around misinformation, privacy, and digital overload. The economy has been fundamentally restructured by technology. E-commerce has disrupted traditional retail, with online giants competing against local shops. The gig economy has created new opportunities for flexible work while raising questions about worker protections. Entire industries have been created around digital products and services that did not exist a generation ago. Meanwhile, automation threatens to displace workers in sectors from manufacturing to transportation to professional services. Navigating this economic transformation requires adaptability and continuous learning. Education has been democratized by technology in unprecedented ways. Online learning platforms offer courses from the world's best universities to anyone with an internet connection. Educational software adapts to individual students' needs and pace. Digital textbooks are updated in real-time and cost a fraction of their physical counterparts. These advances have opened opportunities for people who previously lacked access to quality education. However, the digital divide means that not everyone can take advantage of these opportunities, and questions remain about whether online learning can fully replace the experience of in-person education. Healthcare has been revolutionized by technological advances. Medical imaging allows doctors to see inside the body without surgery. Electronic health records make patient information available wherever it is needed. Telemedicine extends healthcare access to remote areas. Artificial intelligence helps diagnose diseases from medical scans with remarkable accuracy. Gene sequencing has become fast and affordable, opening the door to personalized medicine. These advances have saved countless lives and improved health outcomes for millions. Yet they also raise concerns about data privacy, the cost of medical technology, and the potential for technology to replace the human elements of care. The entertainment industry has been completely transformed. Streaming services have replaced physical media and linear television. Video games have grown into a larger industry than movies. Social media platforms have made everyone a potential content creator. Virtual and augmented reality promise immersive experiences that blur the line between digital and physical worlds. These changes have given consumers unprecedented choice and control while disrupting traditional media business models. Artificial intelligence represents perhaps the most transformative technology on the horizon. Machine learning systems can now perform tasks that once required human intelligence, from recognizing faces to translating languages to driving cars. As AI capabilities advance, they promise to revolutionize industries from healthcare to transportation to creative fields. Yet they also raise profound questions about the future of work, the nature of creativity, and what it means to be human in an age of intelligent machines. Privacy has become one of the central challenges of the digital age. Every click, search, and purchase generates data that companies collect and monetize. Smartphones track our locations, smart speakers listen for voice commands, and social media platforms know our friends, interests, and political views. This data enables personalized services and targeted advertising but also creates risks of surveillance, manipulation, and discrimination. Finding the right balance between the benefits of data-driven services and the protection of privacy is a challenge that individuals, companies, and regulators are all grappling with. Cybersecurity threats have grown in sophistication and severity. Hackers target individuals with phishing attacks and ransomware, stealing personal information and extorting money. Criminal organizations engage in large-scale fraud and identity theft. Nation-states conduct cyber espionage and attack critical infrastructure. Protecting against these threats requires constant vigilance, investment in security measures, and education about cyber risks. The consequences of security failures can be devastating for individuals and organizations alike. The environmental impact of technology is increasingly concerning. Data centers consume vast amounts of electricity, often generated from fossil fuels. The production of electronic devices requires rare earth minerals often mined under problematic conditions. E-waste accumulates as devices are replaced ever more frequently. Climate change itself, driven in part by industrial technologies, poses existential risks. Addressing these challenges requires sustainable approaches to technology development and use, from renewable energy to recyclable materials to longer product lifecycles.`
};

// Vocabulary database
const vocabularyDatabase = {
  'unprecedented': { meaning: 'Never done or known before', example: 'The advancement was unprecedented in history.' },
  'revolutionize': { meaning: 'Change something completely and fundamentally', example: 'Smartphones revolutionized communication.' },
  'innovation': { meaning: 'A new method, idea, or product', example: 'The company is known for its innovation.' },
  'artificial': { meaning: 'Made or produced by human beings rather than occurring naturally', example: 'Artificial intelligence is transforming industries.' },
  'connectivity': { meaning: 'The state of being connected or interconnected', example: 'Global connectivity has increased dramatically.' },
  'sustainability': { meaning: 'Meeting present needs without compromising future generations', example: 'Sustainability is key to environmental protection.' },
  'biodiversity': { meaning: 'The variety of life in the world or a particular habitat', example: 'Biodiversity is essential for healthy ecosystems.' },
  'curriculum': { meaning: 'The subjects comprising a course of study', example: 'The curriculum includes science and arts.' },
  'preventive': { meaning: 'Designed to stop something bad from happening', example: 'Preventive care can reduce health problems.' },
  'destination': { meaning: 'The place to which someone is going', example: 'Paris is a popular tourist destination.' },
  'heritage': { meaning: 'Valued traditions passed down through generations', example: 'Cultural heritage should be preserved.' },
  'perseverance': { meaning: 'Persistence in doing something despite difficulty', example: 'Athletes demonstrate remarkable perseverance.' },
  'entrepreneurship': { meaning: 'The activity of setting up businesses', example: 'Entrepreneurship drives economic growth.' },
  'hypothesis': { meaning: 'A proposed explanation for a phenomenon', example: 'Scientists test each hypothesis carefully.' },
  'aesthetic': { meaning: 'Concerned with beauty or appreciation of beauty', example: 'The design has great aesthetic appeal.' },
  'significant': { meaning: 'Important or worthy of attention', example: 'The discovery had significant implications.' },
  'fundamental': { meaning: 'Forming a necessary base or core', example: 'Education is fundamental to development.' },
  'comprehensive': { meaning: 'Including all or nearly all elements', example: 'A comprehensive study was conducted.' },
  'perspective': { meaning: 'A particular way of viewing things', example: 'Travel broadens your perspective.' },
  'essential': { meaning: 'Absolutely necessary; extremely important', example: 'Water is essential for life.' }
};

// Extract vocabulary from text
const extractVocabulary = (text) => {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const foundVocabulary = [];
  const addedWords = new Set();

  for (const word of words) {
    if (vocabularyDatabase[word] && !addedWords.has(word)) {
      foundVocabulary.push({
        word: word.charAt(0).toUpperCase() + word.slice(1),
        ...vocabularyDatabase[word]
      });
      addedWords.add(word);
      if (foundVocabulary.length >= 8) break;
    }
  }

  return foundVocabulary;
};

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(200).end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Verify authentication for all routes
  const auth = await verifyAuth(req);
  if (auth.error) {
    return res.status(auth.status).json({ message: auth.error });
  }

  const { route } = req.query;
  const routePath = Array.isArray(route) ? route.join('/') : (route || '');

  try {
    // GET /api/speech/topics
    if (routePath === 'topics' && req.method === 'GET') {
      return res.json({ topics });
    }

    // POST /api/speech/generate
    if (routePath === 'generate' && req.method === 'POST') {
      const { topic, duration } = req.body;

      if (!topic || !duration) {
        return res.status(400).json({ message: 'Topic and duration are required' });
      }

      const durationMap = {
        '2-minute': { time: 120, words: 260 },
        '5-minute': { time: 300, words: 650 },
        '10-minute': { time: 600, words: 1300 }
      };

      const { time: expectedTime, words: wordCount } = durationMap[duration] || durationMap['2-minute'];

      let speechText = '';

      // Try to use OpenAI if available
      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are an expert speech writer for English language practice. Write speeches that are clear, well-structured, and use natural vocabulary suitable for intermediate to advanced English learners.`
              },
              {
                role: 'user',
                content: `Write a ${duration.replace('-', ' ')} speech (approximately ${wordCount} words) about "${topic}". 
                
                Requirements:
                - Use clear, well-structured sentences
                - Include a proper introduction, body, and conclusion
                - Use vocabulary appropriate for English learners
                - Make it engaging and informative
                - Write in continuous paragraphs`
              }
            ],
            max_tokens: 2000,
            temperature: 0.7
          });

          speechText = completion.choices[0].message.content;
        } catch (aiError) {
          console.log('AI generation failed, using fallback:', aiError.message);
        }
      }

      // Use fallback if AI didn't work
      if (!speechText) {
        speechText = defaultSpeeches[duration] || defaultSpeeches['2-minute'];
      }

      const vocabulary = extractVocabulary(speechText);

      return res.json({
        topic,
        duration,
        expectedTime,
        speechText,
        wordCount: speechText.split(/\s+/).length,
        vocabulary
      });
    }

    return res.status(404).json({ message: 'Route not found' });
  } catch (error) {
    console.error('Speech API error:', error);
    return res.status(500).json({ message: 'Error processing request' });
  }
};
