// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Content } from '@tiptap/react'
import { MinimalTiptapEditor } from '../minimal-tiptap'
import YouTube from 'react-youtube';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Home, Share, Download, MessageCircle, ClipboardCheck, Menu, Award, User, LogOut, Settings, Moon, Sun, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { appLogo, companyName, serverURL, websiteURL, appName } from '@/constants';
import axios from 'axios';
import ShareOnSocial from 'react-share-on-social';
import StyledText from '@/components/styledText';
import html2pdf from 'html2pdf.js';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Logo from '../res/logo.svg';

const CoursePage = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  //ADDED FROM v4.0
  const { state } = useLocation();
  const { mainTopic, type, courseId, end, pass, lang } = state || {};
  
  console.log('CoursePage state:', state);
  console.log('CoursePage extracted data:', { mainTopic, type, courseId, end, pass, lang });
  
  const jsonData = JSON.parse(sessionStorage.getItem('jsonData'));
  console.log('CoursePage jsonData from sessionStorage:', jsonData);
  const [selected, setSelected] = useState('');
  const [theory, setTheory] = useState('');
  const [media, setMedia] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [isComplete, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keyTakeaways, setKeyTakeaways] = useState([]);
  const [isGeneratingTakeaways, setIsGeneratingTakeaways] = useState(false);
  const defaultMessage = `<p>Hey there! I'm your AI teacher. If you have any questions about your ${mainTopic} course, whether it's about videos, images, or theory, just ask me. I'm here to clear your doubts.</p>`;
  const defaultPrompt = `I have a doubt about this topic :- ${mainTopic}. Please clarify my doubt in very short :- `;

  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<Content>('')

  async function getNotes() {
    try {
      const postURL = serverURL + '/api/getnotes';
      const response = await axios.post(postURL, { course: courseId });
      if (response.data.success) {
        setValue(response.data.message);
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleSaveNote = async () => {
    const postURL = serverURL + '/api/savenotes';
    const response = await axios.post(postURL, { course: courseId, notes: value });
    if (response.data.success) {
      toast({
        title: "Note saved",
        description: "Your note has been saved successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
  };

  // Loading skeleton for course content
  const CourseContentSkeleton = () => (
    <div className="space-y-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <Skeleton className="h-10 w-80 mb-2" />
          <Skeleton className="h-5 w-60" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Quick Actions Card Skeleton */}
      <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Media Section Skeleton */}
      <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="aspect-video w-full">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm">
        <div className="p-6">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      </div>

      {/* Key Points Section Skeleton */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
        <Skeleton className="h-7 w-40 mb-4" />
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    </div>
  );

  //FROM v4.0
  const opts = {
    height: '390',
    width: '640',
  };

  const optsMobile = {
    height: '250px',
    width: '100%',
  };
  // Check if user is logged in
  useEffect(() => {
    const auth = sessionStorage.getItem('auth');
    const name = sessionStorage.getItem('mName');
    if (auth === 'true' && name) {
      setIsLoggedIn(true);
      // Extract first name only
      const firstName = name.split(' ')[0];
      setUserName(firstName);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setUserName('');
    window.location.href = '/';
  };

  useEffect(() => {
    loadMessages()
    getNotes()
    // Ensure the page starts at the top when loaded
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }

    // Ensure window also scrolls to top
    window.scrollTo(0, 0);
    const CountDoneTopics = () => {
      let doneCount = 0;
      let totalTopics = 0;

      jsonData[mainTopic.toLowerCase()].forEach((topic) => {

        topic.subtopics.forEach((subtopic) => {

          if (subtopic.done) {
            doneCount++;
          }
          totalTopics++;
        });
      });
      totalTopics = totalTopics + 1;
      if (pass) {
        doneCount = doneCount + 1;
      }
      const completionPercentage = Math.round((doneCount / totalTopics) * 100);
      setPercentage(completionPercentage);
      if (completionPercentage >= '100') {
        setIsCompleted(true);
      }
    }

    if (!mainTopic) {
      navigate("/create");
    } else {
      if (percentage >= '100') {
        setIsCompleted(true);
      }

      const mainTopicData = jsonData[mainTopic.toLowerCase()][0];
      const firstSubtopic = mainTopicData.subtopics[0];
      firstSubtopic.done = true
      setSelected(firstSubtopic.title)
      setTheory(firstSubtopic.theory);

      if (type === 'video & text course') {
        setMedia(firstSubtopic.youtube);
      } else {
        setMedia(firstSubtopic.image)

      }
      setIsLoading(false);
      sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
      CountDoneTopics();

    }

  }, []);

  const loadMessages = async () => {
    try {
      const jsonValue = sessionStorage.getItem(mainTopic);
      if (jsonValue !== null) {
        setMessages(JSON.parse(jsonValue));
      } else {
        const newMessages = [...messages, { 
          id: Date.now() + Math.random(), 
          text: defaultMessage, 
          sender: 'bot' 
        }];
        setMessages(newMessages);
        await storeLocal(newMessages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  async function storeLocal(messages) {
    try {
      sessionStorage.setItem(mainTopic, JSON.stringify(messages));
    } catch (error) {
      console.error(error);
    }
  }

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const userMessage = { 
      id: Date.now() + Math.random(), 
      text: newMessage, 
      sender: 'user' 
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await storeLocal(updatedMessages);
    setNewMessage('');

    const mainPrompt = defaultPrompt + newMessage;
    const dataToSend = { prompt: mainPrompt };
    const url = serverURL + '/api/chat';

    try {
      const response = await axios.post(url, dataToSend);
      if (response.data.success === false) {
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      } else {
        const botMessage = { 
          id: Date.now() + Math.random() + 1, 
          text: response.data.text, 
          sender: 'bot' 
        };
        const updatedMessagesWithBot = [...updatedMessages, botMessage];
        setMessages(updatedMessagesWithBot);
        await storeLocal(updatedMessagesWithBot);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
      console.error(error);
    }
  };

  const CountDoneTopics = () => {
    let doneCount = 0;
    let totalTopics = 0;

    jsonData[mainTopic.toLowerCase()].forEach((topic) => {

      topic.subtopics.forEach((subtopic) => {

        if (subtopic.done) {
          doneCount++;
        }
        totalTopics++;
      });
    });
    totalTopics = totalTopics + 1;
    if (pass) {
      totalTopics = totalTopics - 1;
    }
    const completionPercentage = Math.round((doneCount / totalTopics) * 100);
    setPercentage(completionPercentage);
    if (completionPercentage >= '100') {
      setIsCompleted(true);
    }
  }

  const handleSelect = (topics, sub) => {
    if (!isLoading) {
      const mTopic = jsonData[mainTopic.toLowerCase()].find(topic => topic.title === topics);
      const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);

      if (mSubTopic.theory === '' || mSubTopic.theory === undefined || mSubTopic.theory === null) {
        if (type === 'video & text course') {

          const query = `educational tutorial ${mSubTopic.title} ${mainTopic} explained step by step`;
          setIsLoading(true);
          sendVideo(query, topics, sub, mSubTopic.title);

        } else {

          const prompt = `Create a premium, engaging, and comprehensive lesson about "${mSubTopic.title}" in ${mainTopic}. 

IMPORTANT: Generate ONLY the content body - NO HTML document structure, NO <html>, <head>, <body>, or <style> tags. Just the content that goes inside the lesson.

Structure the content as a modern, professional e-learning module with the following sections:

1. **Introduction** (use <h2> tag): A compelling hook and overview of what students will learn
2. **Core Concepts** (use <h3> tags): Break down the main ideas with clear explanations
3. **Real-World Examples** (use <h3> tag): Provide 2-3 practical, relatable examples
4. **Step-by-Step Process** (use <h3> tag): If applicable, provide actionable steps
5. **Pro Tips & Best Practices** (use <h3> tag): Share insider knowledge and expert advice
6. **Common Mistakes to Avoid** (use <h3> tag): Help students learn from others' errors
7. **Summary & Key Takeaways** (use <h2> tag): Reinforce the most important points

Use rich HTML formatting:
- Use <h2> for main sections and <h3> for subsections
- Use <p> for paragraphs with engaging, conversational tone
- Use <ul> and <li> for lists and bullet points
- Use <strong> for important terms and concepts
- Use <em> for emphasis and key insights
- Use <blockquote> for expert quotes or important callouts
- Use <div class="highlight-box"> for key insights or tips

IMPORTANT: Do NOT use any inline styles, colors, or custom formatting. The content will be styled automatically by the platform.

Write in ${lang} with a professional yet conversational tone. Make it engaging, practical, and immediately applicable. Include specific examples, actionable advice, and insights that make students feel they're getting premium, insider knowledge.

Start directly with the content - no document structure tags.`;
          const promptImage = `A clear, professional visual example or diagram showing ${mSubTopic.title} in ${mainTopic}`;
          setIsLoading(true);
          sendPrompt(prompt, promptImage, topics, sub);

        }
      } else {
        setSelected(mSubTopic.title)
        setTheory(mSubTopic.theory)
        if (type === 'video & text course') {
          setMedia(mSubTopic.youtube);
        } else {
          setMedia(mSubTopic.image)
        }
      }
      
      // Generate custom key takeaways for existing content
      if (mSubTopic.theory) {
        generateKeyTakeaways(mSubTopic.theory, mSubTopic.title);
      }
    }
  };

  const handleCompletionToggle = (topics, sub, checked) => {
    const mTopic = jsonData[mainTopic.toLowerCase()].find(topic => topic.title === topics);
    const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);
    
    if (mSubTopic) {
      mSubTopic.done = checked;
      updateCourse();
      
      toast({
        title: checked ? "Marked as Complete" : "Marked as Incomplete",
        description: `${sub} has been ${checked ? 'marked as complete' : 'marked as incomplete'}.`,
      });
    }
  };

  // Function to find current topic and subtopic information
  const getCurrentTopicInfo = () => {
    if (!selected || !jsonData) return null;
    
    for (const topic of jsonData[mainTopic.toLowerCase()]) {
      const subtopic = topic.subtopics.find(sub => sub.title === selected);
      if (subtopic) {
        return { topic: topic.title, subtopic: subtopic.title, done: subtopic.done };
      }
    }
    return null;
  };

  // Function to clean HTML content and remove document structure
  const cleanHtmlContent = (htmlContent) => {
    // Remove HTML document structure tags
    let cleaned = htmlContent
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '');
    
    // Remove inline styles and colors
    cleaned = cleaned
      .replace(/style="[^"]*"/gi, '')
      .replace(/style='[^']*'/gi, '')
      .replace(/color="[^"]*"/gi, '')
      .replace(/color='[^']*'/gi, '')
      .replace(/background-color="[^"]*"/gi, '')
      .replace(/background-color='[^']*'/gi, '')
      .replace(/font-size="[^"]*"/gi, '')
      .replace(/font-size='[^']*'/gi, '')
      .replace(/font-weight="[^"]*"/gi, '')
      .replace(/font-weight='[^']*'/gi, '')
      .replace(/text-align="[^"]*"/gi, '')
      .replace(/text-align='[^']*'/gi, '');
    
    // Remove any remaining style attributes
    cleaned = cleaned.replace(/\s+style="[^"]*"/gi, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Function to generate custom key takeaways
  const generateKeyTakeaways = async (content, topic) => {
    setIsGeneratingTakeaways(true);
    try {
      const takeawayPrompt = `Based on this lesson content about "${topic}", generate 3-4 specific, actionable key takeaways that students should remember and apply.

Content: ${content.substring(0, 2000)} // Limit content length for API

Generate takeaways in this exact JSON format:
[
  {
    "title": "Short, actionable title",
    "description": "Brief explanation of why this is important and how to apply it"
  }
]

Make the takeaways:
- Specific to the lesson content
- Actionable and practical
- Easy to remember and apply
- Relevant to the topic being taught
- Professional and educational in tone

Return only the JSON array, no other text.`;

      const dataToSend = { prompt: takeawayPrompt };
      const postURL = serverURL + '/api/generate';
      const response = await axios.post(postURL, dataToSend);
      
      try {
        const takeaways = JSON.parse(response.data.text);
        setKeyTakeaways(takeaways);
      } catch (parseError) {
        console.error('Error parsing takeaways:', parseError);
        // Fallback to default takeaways
        setKeyTakeaways([
          {
            title: "Review Core Concepts",
            description: "Take time to review the main concepts covered in this lesson"
          },
          {
            title: "Practice Application",
            description: "Practice applying these concepts to reinforce your understanding"
          },
          {
            title: "Mark as Complete",
            description: "Mark this lesson as complete when you feel confident with the material"
          }
        ]);
      }
    } catch (error) {
      console.error('Error generating takeaways:', error);
      // Fallback to default takeaways
      setKeyTakeaways([
        {
          title: "Review Core Concepts",
          description: "Take time to review the main concepts covered in this lesson"
        },
        {
          title: "Practice Application",
          description: "Practice applying these concepts to reinforce your understanding"
        },
        {
          title: "Mark as Complete",
          description: "Mark this lesson as complete when you feel confident with the material"
        }
      ]);
    } finally {
      setIsGeneratingTakeaways(false);
    }
  };

  async function sendPrompt(prompt, promptImage, topics, sub) {
    const dataToSend = {
      prompt: prompt,
    };
    try {
      const postURL = serverURL + '/api/generate';
      const res = await axios.post(postURL, dataToSend);
      const generatedText = res.data.text;
      const cleanedContent = cleanHtmlContent(generatedText);
      try {
        const parsedJson = cleanedContent;
        sendImage(parsedJson, promptImage, topics, sub);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendImage(parsedJson, promptImage, topics, sub) {
    const dataToSend = {
      prompt: promptImage,
    };
    try {
      const postURL = serverURL + '/api/image';
      const res = await axios.post(postURL, dataToSend);
      try {
        const generatedText = res.data.url;
        sendData(generatedText, parsedJson, topics, sub);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendData(image, theory, topics, sub) {

    const mTopic = jsonData[mainTopic.toLowerCase()].find(topic => topic.title === topics);
    const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);
    mSubTopic.theory = theory
    mSubTopic.image = image;
    setSelected(mSubTopic.title)

    setIsLoading(false);
    setTheory(theory)
    if (type === 'video & text course') {
      setMedia(mSubTopic.youtube);
    } else {
          setMedia(image)
  }
  
  // Generate custom key takeaways
  generateKeyTakeaways(theory, sub);
  
  // Removed automatic completion - user will manually toggle
  updateCourse();
  }

  async function sendDataVideo(image, theory, topics, sub) {

    const mTopic = jsonData[mainTopic.toLowerCase()].find(topic => topic.title === topics);
    const mSubTopic = mTopic?.subtopics.find(subtopic => subtopic.title === sub);
    mSubTopic.theory = theory
    mSubTopic.youtube = image;
    setSelected(mSubTopic.title)

    setIsLoading(false);
    setTheory(theory)
    if (type === 'video & text course') {
      setMedia(image);
    } else {
          setMedia(mSubTopic.image)
  }
  
  // Generate custom key takeaways
  generateKeyTakeaways(theory, sub);
  
  // Removed automatic completion - user will manually toggle
  updateCourse();

  }

  async function updateCourse() {
    CountDoneTopics();
    sessionStorage.setItem('jsonData', JSON.stringify(jsonData));
    const dataToSend = {
      content: JSON.stringify(jsonData),
      courseId: courseId
    };
    try {
      const postURL = serverURL + '/api/update';
      await axios.post(postURL, dataToSend);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendVideo(query, mTopic, mSubTopic, subtop) {
    const dataToSend = {
      prompt: query,
    };
    try {
      const postURL = serverURL + '/api/yt';
      const res = await axios.post(postURL, dataToSend);

      try {
        const generatedText = res.data.url;
        sendTranscript(generatedText, mTopic, mSubTopic, subtop);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function sendTranscript(url, mTopic, mSubTopic, subtop) {
    const dataToSend = {
      prompt: url,
    };
    try {
      const postURL = serverURL + '/api/transcript';
      const res = await axios.post(postURL, dataToSend);

      try {
        const generatedText = res.data.url;
        const allText = generatedText.map(item => item.text);
        const concatenatedText = allText.join(' ');
        const prompt = `Create a premium, engaging lesson summary from this video content about "${subtop}" in ${mainTopic}. 

IMPORTANT: Generate ONLY the content body - NO HTML document structure, NO <html>, <head>, <body>, or <style> tags. Just the content that goes inside the lesson.

Structure the content as a modern, professional e-learning module with the following sections:

1. **Introduction** (use <h2> tag): A compelling overview of what the video covers
2. **Key Concepts** (use <h3> tags): Break down the main ideas from the video
3. **Real-World Applications** (use <h3> tag): How to apply these concepts practically
4. **Pro Insights** (use <h3> tag): Advanced tips and expert-level insights
5. **Action Items** (use <h3> tag): Specific steps students can take immediately
6. **Summary & Key Takeaways** (use <h2> tag): Reinforce the most important points

Use rich HTML formatting:
- Use <h2> for main sections and <h3> for subsections
- Use <p> for paragraphs with engaging, conversational tone
- Use <ul> and <li> for lists and bullet points
- Use <strong> for important terms and concepts
- Use <em> for emphasis and key insights
- Use <blockquote> for expert quotes or important callouts
- Use <div class="highlight-box"> for key insights or tips

Write in ${lang} with a professional yet conversational tone. Make it engaging, practical, and immediately applicable. Include specific examples, actionable advice, and insights that make students feel they're getting premium, insider knowledge.

Start directly with the content - no document structure tags.`;
        sendSummery(prompt, url, mTopic, mSubTopic);
      } catch (error) {
        console.error(error)
        const prompt = `Create a premium, engaging, and comprehensive lesson about "${subtop}" in ${mainTopic}. 

IMPORTANT: Generate ONLY the content body - NO HTML document structure, NO <html>, <head>, <body>, or <style> tags. Just the content that goes inside the lesson.

Structure the content as a modern, professional e-learning module with the following sections:

1. **Introduction** (use <h2> tag): A compelling hook and overview of what students will learn
2. **Core Concepts** (use <h3> tags): Break down the main ideas with clear explanations
3. **Real-World Examples** (use <h3> tag): Provide 2-3 practical, relatable examples
4. **Step-by-Step Process** (use <h3> tag): If applicable, provide actionable steps
5. **Pro Tips & Best Practices** (use <h3> tag): Share insider knowledge and expert advice
6. **Common Mistakes to Avoid** (use <h3> tag): Help students learn from others' errors
7. **Summary & Key Takeaways** (use <h2> tag): Reinforce the most important points

Use rich HTML formatting:
- Use <h2> for main sections and <h3> for subsections
- Use <p> for paragraphs with engaging, conversational tone
- Use <ul> and <li> for lists and bullet points
- Use <strong> for important terms and concepts
- Use <em> for emphasis and key insights
- Use <blockquote> for expert quotes or important callouts
- Use <div class="highlight-box"> for key insights or tips

Write in ${lang} with a professional yet conversational tone. Make it engaging, practical, and immediately applicable. Include specific examples, actionable advice, and insights that make students feel they're getting premium, insider knowledge.

Start directly with the content - no document structure tags.`;
        sendSummery(prompt, url, mTopic, mSubTopic);
      }

    } catch (error) {
      console.error(error)
      const prompt = `Create a premium, engaging, and comprehensive lesson about "${subtop}" in ${mainTopic}. 

IMPORTANT: Generate ONLY the content body - NO HTML document structure, NO <html>, <head>, <body>, or <style> tags. Just the content that goes inside the lesson.

Structure the content as a modern, professional e-learning module with the following sections:

1. **Introduction** (use <h2> tag): A compelling hook and overview of what students will learn
2. **Core Concepts** (use <h3> tags): Break down the main ideas with clear explanations
3. **Real-World Examples** (use <h3> tag): Provide 2-3 practical, relatable examples
4. **Step-by-Step Process** (use <h3> tag): If applicable, provide actionable steps
5. **Pro Tips & Best Practices** (use <h3> tag): Share insider knowledge and expert advice
6. **Common Mistakes to Avoid** (use <h3> tag): Help students learn from others' errors
7. **Summary & Key Takeaways** (use <h2> tag): Reinforce the most important points

Use rich HTML formatting:
- Use <h2> for main sections and <h3> for subsections
- Use <p> for paragraphs with engaging, conversational tone
- Use <ul> and <li> for lists and bullet points
- Use <strong> for important terms and concepts
- Use <em> for emphasis and key insights
- Use <blockquote> for expert quotes or important callouts
- Use <div class="highlight-box"> for key insights or tips

Write in ${lang} with a professional yet conversational tone. Make it engaging, practical, and immediately applicable. Include specific examples, actionable advice, and insights that make students feel they're getting premium, insider knowledge.

Start directly with the content - no document structure tags.`;
      sendSummery(prompt, url, mTopic, mSubTopic);
    }
  }

  async function sendSummery(prompt, url, mTopic, mSubTopic) {
    const dataToSend = {
      prompt: prompt,
    };
    try {
      const postURL = serverURL + '/api/generate';
      const res = await axios.post(postURL, dataToSend);
      const generatedText = res.data.text;
      const cleanedContent = cleanHtmlContent(generatedText);
      try {
        const parsedJson = cleanedContent;
        sendDataVideo(url, parsedJson, mTopic, mSubTopic);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
        setIsLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
      setIsLoading(false);
    }
  }

  async function htmlDownload() {
    setExporting(true);
    // Generate the combined HTML content
    const combinedHtml = await getCombinedHtml(mainTopic, jsonData[mainTopic.toLowerCase()]);

    // Create a temporary div element
    const tempDiv = document.createElement('div');
    tempDiv.style.width = '100%';  // Ensure div is 100% width
    tempDiv.style.height = '100%';  // Ensure div is 100% height
    tempDiv.innerHTML = combinedHtml;
    document.body.appendChild(tempDiv);

    // Create the PDF options
    const options = {
      filename: `${mainTopic}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      margin: [15, 15, 15, 15],
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      html2canvas: {
        scale: 2,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        useCORS: true
      },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
    };

    // Generate the PDF
    html2pdf().from(tempDiv).set(options).save().then(() => {
      // Save the PDF
      document.body.removeChild(tempDiv);
      setExporting(false);
    });
  }

  async function getCombinedHtml(mainTopic, topics) {

    async function toDataUrl(url) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = function () {
          const reader = new FileReader();
          reader.onloadend = function () {
            resolve(reader.result);
          };
          reader.readAsDataURL(xhr.response);
        };

        xhr.onerror = function () {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        };

        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.send();
      }).catch(error => {
        console.error(`Failed to fetch image at ${url}:`, error);
        return ''; // Fallback or placeholder
      });
    }

    const topicsHtml = topics.map(topic => `
        <h3 style="font-size: 18pt; font-weight: bold; margin: 0; margin-top: 15px;">${topic.title}</h3>
        ${topic.subtopics.map(subtopic => `
            <p style="font-size: 16pt; margin-top: 10px;">${subtopic.title}</p>
        `).join('')}
    `).join('');

    const theoryPromises = topics.map(async topic => {
      const subtopicPromises = topic.subtopics.map(async (subtopic, index, array) => {
        const imageUrl = type === 'text & image course' ? await toDataUrl(subtopic.image) : ``;
        return `
            <div>
                <p style="font-size: 16pt; margin-top: 20px; font-weight: bold;">
                    ${subtopic.title}
                </p>
                <div style="font-size: 12pt; margin-top: 15px;">
                    ${subtopic.done
            ? `
                            ${type === 'text & image course'
              ? (imageUrl ? `<img style="margin-top: 10px;" src="${imageUrl}" alt="${subtopic.title} image">` : `<a style="color: #0000FF;" href="${subtopic.image}" target="_blank">View example image</a>`)
              : `<a style="color: #0000FF;" href="https://www.youtube.com/watch?v=${subtopic.youtube}" target="_blank" rel="noopener noreferrer">Watch the YouTube video on ${subtopic.title}</a>`
            }
                            <div style="margin-top: 10px;">${subtopic.theory}</div>
                        `
            : `<div style="margin-top: 10px;">Please visit ${subtopic.title} topic to export as PDF. Only topics that are completed will be added to the PDF.</div>`
          }
                </div>
            </div>
        `;
      });
      const subtopicHtml = await Promise.all(subtopicPromises);
      return `
            <div style="margin-top: 30px;">
                <h3 style="font-size: 18pt; text-align: center; font-weight: bold; margin: 0;">
                    ${topic.title}
                </h3>
                ${subtopicHtml.join('')}
            </div>
        `;
    });
    const theoryHtml = await Promise.all(theoryPromises);

    return `
    <div class="html2pdf__page-break" 
         style="display: flex; align-items: center; justify-content: center; text-align: center; margin: 0 auto; max-width: 100%; height: 11in;">
        <h1 style="font-size: 30pt; font-weight: bold; margin: 0;">
            ${mainTopic}
        </h1>
    </div>
    <div class="html2pdf__page-break" style="text-align: start; margin-top: 30px; margin-right: 16px; margin-left: 16px;">
        <h2 style="font-size: 24pt; font-weight: bold; margin: 0;">Index</h2>
        <br>
        <hr>
        ${topicsHtml}
    </div>
    <div style="text-align: start; margin-right: 16px; margin-left: 16px;">
        ${theoryHtml.join('')}
    </div>
    `;
  }

  async function redirectExam() {
    if (!isLoading) {
      setIsLoading(true);
      const mainTopicExam = jsonData[mainTopic.toLowerCase()];
      let subtopicsString = '';
      mainTopicExam.map((topicTemp) => {
        const titleOfSubTopic = topicTemp.title;
        subtopicsString = subtopicsString + ' , ' + titleOfSubTopic;
      });
      const postURL = serverURL + '/api/aiexam';
      const response = await axios.post(postURL, { courseId, mainTopic, subtopicsString, lang });
      if (response.data.success) {
        setIsLoading(false);
        const questions = JSON.parse(response.data.message);
        navigate('/course/'+ courseId +'/quiz', { state: { topic: mainTopic, courseId: courseId, questions: questions } });
      } else {
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      }
    }
  }

  const renderTopicsAndSubtopics = (topics) => {
    return (
      <>
        {topics.map((topic) => (
          <Accordion key={topic.title} type="single" collapsible className="mb-3">
            <AccordionItem value={topic.title} className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
              <AccordionTrigger className="py-4 px-4 text-left hover:bg-accent/50 transition-all duration-200 font-medium text-foreground">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold">{topic.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {topic.subtopics.filter(sub => sub.done).length}/{topic.subtopics.length}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-2">
                <div className="space-y-1">
                {topic.subtopics.map((subtopic) => (
                  <div
                    onClick={() => handleSelect(topic.title, subtopic.title)}
                    key={subtopic.title}
                    className={cn(
                        "flex items-center px-4 py-3 mx-2 rounded-md hover:bg-accent/50 transition-all duration-200 cursor-pointer group",
                        subtopic.done && "bg-primary/10 border-l-2 border-primary"
                      )}
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-3">
                        {subtopic.done ? (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full group-hover:border-primary/50 transition-colors"></div>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        subtopic.done ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {subtopic.title}
                      </span>
                  </div>
                ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </>
    );
  }

  function certificateCheck() {
    if (isComplete) {
      finish();
    } else {
      toast({
        title: "Completion Certificate",
        description: "Complete course to get certificate",
      });
    }
  }

  async function finish() {
    if (sessionStorage.getItem('first') === 'true') {
      if (!end) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB');
        navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      } else {
        navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: end } });
      }

    } else {
      const dataToSend = {
        courseId: courseId
      };
      try {
        const postURL = serverURL + '/api/finish';
        const response = await axios.post(postURL, dataToSend);
        if (response.data.success) {
          const today = new Date();
          const formattedDate = today.toLocaleDateString('en-GB');
          sessionStorage.setItem('first', 'true');
          sendEmail(formattedDate);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function sendEmail(formattedDate) {
    const userName = sessionStorage.getItem('mName');
    const email = sessionStorage.getItem('email');
    const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
                <html lang="en">
                
                  <head></head>
                 <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">Certificate<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
                 </div>
                
                  <body style="padding:20px; margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:#f6f9fc;font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, &quot;Noto Sans&quot;, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;, &quot;Noto Color Emoji&quot;">
                    <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" height="80%" width="100%" style="max-width:37.5em;max-height:80%; margin-left:auto;margin-right:auto;margin-top:80px;margin-bottom:80px;width:465px;border-radius:0.25rem;border-width:1px;background-color:#fff;padding:20px">
                      <tr style="width:100%">
                        <td>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-top:32px">
                            <tbody>
                              <tr>
                                <td><img alt="Vercel" src="${appLogo}" width="40" height="37" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
                              </tr>
                            </tbody>
                          </table>
                          <h1 style="margin-left:0px;margin-right:0px;margin-top:30px;margin-bottom:30px;padding:0px;text-align:center;font-size:24px;font-weight:400;color:rgb(0,0,0)">Completion Certificate </h1>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Hello <strong>${userName}</strong>,</p>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">We are pleased to inform you that you have successfully completed the ${mainTopic} and are now eligible for your course completion certificate. Congratulations on your hard work and dedication throughout the course!</p>
                          <table align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%" style="margin-bottom:32px;margin-top:32px;text-align:center">
                            <tbody>
                              <tr>
                                <td><a href="${websiteURL}" target="_blank" style="p-x:20px;p-y:12px;line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color: #007BFF;text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="p-x:20px;p-y:12px;max-width:100%;display:inline-block;line-height:120%;text-decoration:none;text-transform:none;mso-padding-alt:0px;mso-text-raise:9px"><span>Get Certificate</span></a></td>
                              </tr>
                            </tbody>
                          </table>
                          <p style="font-size:14px;line-height:24px;margin:16px 0;color:rgb(0,0,0)">Best,<p target="_blank" style="color:rgb(0,0,0);text-decoration:none;text-decoration-line:none">The <strong>${companyName}</strong> Team</p></p>
                          </td>
                      </tr>
                    </table>
                  </body>
                
                </html>`;

    try {
      const postURL = serverURL + '/api/sendcertificate';
      await axios.post(postURL, { html, email }).then(res => {
        navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      }).catch(error => {
        console.error(error);
        navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
      });

    } catch (error) {
      console.error(error);
      navigate('/course/'+courseId+'/certificate', { state: { courseTitle: mainTopic, end: formattedDate } });
    }

  }

  const renderTopicsAndSubtopicsMobile = (topics) => {
    return (
      <>
        {topics.map((topic) => (
          <Accordion key={topic.title} type="single" collapsible className="mb-3">
            <AccordionItem value={topic.title} className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
              <AccordionTrigger className="py-4 px-4 text-left hover:bg-accent/50 transition-all duration-200 font-medium text-foreground">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-semibold">{topic.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {topic.subtopics.filter(sub => sub.done).length}/{topic.subtopics.length}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-2">
                <div className="space-y-1">
                {topic.subtopics.map((subtopic) => (
                  <div
                    onClick={() => handleSelect(topic.title, subtopic.title)}
                    key={subtopic.title}
                    className={cn(
                        "flex items-center px-4 py-3 mx-2 rounded-md hover:bg-accent/50 transition-all duration-200 cursor-pointer group",
                        subtopic.done && "bg-primary/10 border-l-2 border-primary"
                      )}
                    >
                      <div className="flex items-center justify-center w-5 h-5 mr-3">
                        {subtopic.done ? (
                          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-bold">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full group-hover:border-primary/50 transition-colors"></div>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm transition-colors",
                        subtopic.done ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {subtopic.title}
                      </span>
                  </div>
                ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="border-b border-border/40 h-12 px-4 flex justify-between items-center sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Site Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <img src={Logo} alt="Logo" className='h-5 w-5' />
            </div>
            <span className="font-display font-medium text-base">{appName}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ToggleGroup type="single" className="hidden sm:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to='/dashboard'>
                <Home className="h-4 w-4 mr-1" /> Home
              </Link>
            </Button>
            <Button onClick={certificateCheck} variant="ghost" size="sm" asChild>
              <span className='cursor-pointer'><Award className="h-4 w-4 mr-1" /> Certificate</span>
            </Button>
            <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm" asChild>
              <span className='cursor-pointer'><Download className="h-4 w-4 mr-1" />{exporting ? 'Exporting...' : 'Export'}</span>
            </Button>
            <ShareOnSocial
              textToShare={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              link={websiteURL + '/shareable?id=' + courseId}
              linkTitle={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
              linkFavicon={appLogo}
              noReferer
            >
              <Button variant="ghost" size="sm" asChild>
                <span className='cursor-pointer'><Share className="h-4 w-4 mr-1" /> Share</span>
              </Button>
            </ShareOnSocial>
          </ToggleGroup>
          
          {/* User Avatar Dropdown - Desktop */}
          {isLoggedIn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center space-x-2 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-semibold">Hey {userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center space-x-2 px-2 py-1.5"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                  <span>Theme</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Hamburger Menu - Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Mobile Controls */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* User Avatar Dropdown - Mobile */}
            {isLoggedIn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3 w-3" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center space-x-2 px-2 py-1.5"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                    <span>Theme</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Hamburger Menu - Mobile */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[80vh]">
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">Course Content</h2>
                    <p className="text-sm text-muted-foreground">Navigate through your course modules</p>
                  </div>
                  <ScrollArea className="h-[60vh]">
                    <div className="pr-4">
                      {jsonData && renderTopicsAndSubtopics(jsonData[mainTopic.toLowerCase()])}
                      <div 
                        onClick={redirectExam}
                        className={cn(
                          "flex items-center px-4 py-3 mx-2 rounded-md hover:bg-accent/50 transition-all duration-200 cursor-pointer group border border-border/50",
                          pass === true && "bg-primary/10 border-l-2 border-primary"
                        )}
                      >
                        <div className="flex items-center justify-center w-5 h-5 mr-3">
                          {pass === true ? (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-primary-foreground text-xs font-bold">✓</span>
                            </div>
                          ) : (
                            <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full group-hover:border-primary/50 transition-colors"></div>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm transition-colors",
                          pass === true ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {mainTopic} Quiz
                        </span>
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={cn(
          "bg-card border-r border-border/40 transition-all duration-300 overflow-hidden hidden md:block shadow-sm",
          isMenuOpen ? "w-80" : "w-0"
        )}>
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent leading-none">Course Content</h2>
                <p className="text-sm text-muted-foreground">Navigate through your course modules</p>
              </div>
              {jsonData && renderTopicsAndSubtopicsMobile(jsonData[mainTopic.toLowerCase()])}
              <div 
                onClick={redirectExam}
                className={cn(
                  "flex items-center px-4 py-3 mx-2 rounded-md hover:bg-accent/50 transition-all duration-200 cursor-pointer group border border-border/50",
                  pass === true && "bg-primary/10 border-l-2 border-primary"
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 mr-3">
                  {pass === true ? (
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">✓</span>
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full group-hover:border-primary/50 transition-colors"></div>
                  )}
                </div>
                <span className={cn(
                  "text-sm transition-colors",
                  pass === true ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {mainTopic} Quiz
                </span>
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" viewportref={mainContentRef}>
            <main className="p-6 pb-20 md:pb-6">
              {isLoading ? (
                <CourseContentSkeleton />
              ) : (
                <div className="space-y-8">
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start">
                      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent leading-none mb-2">{selected}</h1>
                      <p className="text-muted-foreground">Learn about {selected.toLowerCase()} in {mainTopic}</p>
                    </div>
                    {getCurrentTopicInfo() && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={getCurrentTopicInfo().done}
                            onCheckedChange={(checked) => handleCompletionToggle(
                              getCurrentTopicInfo().topic, 
                              getCurrentTopicInfo().subtopic, 
                              checked
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            {getCurrentTopicInfo().done ? 'Completed' : 'Mark as Complete'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Card */}
                  <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Course Actions</h2>
                      <div className="text-sm text-muted-foreground">
                        {percentage}% complete
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Back to Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => redirectExam()}
                        className="flex items-center gap-2"
                      >
                        <Award className="h-4 w-4" />
                        Take Quiz
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => htmlDownload()}
                        disabled={exporting}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        {exporting ? 'Exporting...' : 'Export Course'}
                      </Button>
                    </div>
                  </div>

                  {/* Media Section */}
                  {media && (
                    <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6">
                        {type === 'video & text course' && (
                          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            Video Lesson
                          </h2>
                        )}
                        <div className="flex justify-center">
                          {type === 'video & text course' ? (
                            <div className="w-full">
                              <YouTube key={media} videoId={media} opts={opts} />
                            </div>
                          ) : (
                            <div className="w-full">
                              <div className="aspect-video w-full">
                                <img 
                                  className="w-full h-full object-cover rounded-lg shadow-lg" 
                                  src={media} 
                                  alt={`Visual example for ${selected}`} 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  {theory && (
                    <div className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-sm">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-xl font-semibold flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Learning Content
                          </h2>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                              Premium Content
                            </div>
                          </div>
                        </div>
                        <div className="prose prose-gray dark:prose-invert max-w-none premium-content" style={{ fontFamily: 'inherit' }}>
                          <StyledText text={theory} />
                        </div>
                        <div className="mt-8 pt-6 border-t border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Content loaded successfully</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Download className="h-4 w-4 mr-1" />
                                Print
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Points Section */}
                  {theory && (
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          Key Takeaways
                        </h2>
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">
                            AI Generated
                          </div>
                          {isGeneratingTakeaways && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Generating...</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {isGeneratingTakeaways ? (
                        <div className="grid gap-4">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/10 animate-pulse">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-muted rounded mb-2"></div>
                                <div className="h-3 bg-muted rounded w-3/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {keyTakeaways.length > 0 ? (
                            keyTakeaways.map((takeaway, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/10 hover:bg-white/70 dark:hover:bg-black/30 transition-colors">
                                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <p className="text-sm font-medium text-foreground mb-1">{takeaway.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {takeaway.description}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/10">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-foreground mb-1">Review Core Concepts</p>
                                <p className="text-xs text-muted-foreground">
                                  Take time to review the main concepts covered in this lesson
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                                              <div className="mt-6 pt-4 border-t border-primary/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Ready to continue learning</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => generateKeyTakeaways(theory, selected)}
                                disabled={isGeneratingTakeaways}
                              >
                                {isGeneratingTakeaways ? 'Generating...' : 'Regenerate'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Find next lesson logic here
                                  toast({
                                    title: "Great progress!",
                                    description: "You're ready for the next lesson.",
                                  });
                                }}
                              >
                                Next Lesson
                              </Button>
                            </div>
                          </div>
                        </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </ScrollArea>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-2 flex justify-around items-center shadow-lg">
        <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
          <Link to='/dashboard' className="flex flex-col items-center gap-1">
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
        </Button>
        <Button onClick={certificateCheck} variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
          <Award className="h-5 w-5" />
          <span className="text-xs">Certificate</span>
        </Button>
        <Button onClick={htmlDownload} disabled={exporting} variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
          <Download className="h-5 w-5" />
          <span className="text-xs">{exporting ? 'Exporting' : 'Export'}</span>
        </Button>
        <ShareOnSocial
          textToShare={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          link={websiteURL + '/shareable?id=' + courseId}
          linkTitle={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          linkMetaDesc={sessionStorage.getItem('mName') + " shared you course on " + mainTopic}
          linkFavicon={appLogo}
          noReferer
        >
          <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2">
            <Share className="h-5 w-5" />
            <span className="text-xs">Share</span>
          </Button>
        </ShareOnSocial>
      </div>

      <div className="fixed bottom-20 right-6 flex flex-col gap-3 md:bottom-6">
        <Button
          size="icon"
          className="rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => setIsChatOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full bg-gradient-to-r from-primary to-indigo-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          onClick={() => setIsNotesOpen(true)}
        >
          <ClipboardCheck className="h-5 w-5" />
        </Button>
      </div>

      {isMobile ? (
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-full p-0">
            <div className="flex flex-col h-full p-4">
              <div className="py-2 px-4 border-b border-border mb-2">
                <h2 className="text-lg font-semibold">Course Assistant</h2>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2 px-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2 p-4 border-t border-border">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogTitle>Course Assistant</DialogTitle>
            <DialogDescription>
              Ask questions about your course content and get AI-powered assistance.
            </DialogDescription>
            <div className="flex flex-col h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex w-2/4 max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                        message.sender === "user"
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <StyledText text={message.text} />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isMobile ? (
        <Sheet open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <SheetContent side="bottom" className="h-[90vh] sm:max-w-full p-0">
            <div className="flex flex-col h-full p-4">
              <div className="py-2 px-4 border-b border-border mb-2">
                <h2 className="text-lg font-semibold">Course Notes</h2>
              </div>
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2 px-4">
                  <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="No notes yet. Start taking notes for this course."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote}>{saving ? 'Saving...' : 'Save Note'}</Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogTitle>Course Notes</DialogTitle>
            <div className="flex flex-col h-[60vh]">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4 pt-2">
                  <MinimalTiptapEditor
                    value={value}
                    onChange={setValue}
                    className="w-full"
                    editorContentClassName="p-5"
                    output="html"
                    placeholder="No notes yet. Start taking notes for this course."
                    autofocus={true}
                    editable={true}
                    editorClassName="focus:outline-none"
                  />
                </div>
              </ScrollArea>

              <div>
                <div className="flex justify-end">
                  <Button disabled={saving} onClick={handleSaveNote}>{saving ? 'Saving...' : 'Save Note'}</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CoursePage;