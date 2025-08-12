// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Save, Brain, BookOpen, Image, FileText, Zap, Settings, Eye, Copy, RotateCcw } from "lucide-react";
import { serverURL } from '@/constants';
import axios from 'axios';

const AdminPromptSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [prompts, setPrompts] = useState({
    courseStructure: {
      name: 'Course Structure Generation',
      description: 'Generates the initial course structure with topics and subtopics',
      template: `Strictly in {language}, Generate a list of Strict {topicCount} topics and any number sub topic for each topic for main title {mainTopic}, everything in single line. Those {topicCount} topics should Strictly include these topics :- {subtopics}. Strictly Keep theory, youtube, image field empty. Generate in the form of JSON in this format {
  "{mainTopic}": [
    {
      "title": "Topic Title",
      "subtopics": [
        {
          "title": "Sub Topic Title",
          "theory": "",
          "youtube": "",
          "image": "",
          "done": false
        }
      ]
    }
  ]
}`,
      variables: ['{language}', '{topicCount}', '{mainTopic}', '{subtopics}'],
      enabled: true
    },
    theoryContent: {
      name: 'Theory Content Generation',
      description: 'Generates detailed explanations for subtopics with examples',
      template: `Strictly in {language}, Explain me about this subtopic of {mainTopic} with examples :- {subtopic}. Please Strictly Don't Give Additional Resources And Images.`,
      variables: ['{language}', '{mainTopic}', '{subtopic}'],
      enabled: true
    },
    imageGeneration: {
      name: 'Image Generation',
      description: 'Generates relevant images for subtopics',
      template: `Example of {subtopic} in {mainTopic}`,
      variables: ['{subtopic}', '{mainTopic}'],
      enabled: true
    },
    quizGeneration: {
      name: 'Quiz/Exam Generation',
      description: 'Generates MCQ quizzes based on course content',
      template: `Strictly in {language},
generate a strictly 10 question MCQ quiz on title {mainTopic} based on each topics :- {subtopicsString}, Atleast One question per topic. Add options A, B, C, D and only one correct answer. Give your response Strictly inJSON format like this :-
{
  "{mainTopic}": [
    {
      "topic": "topic title",
      "question": "",
      "options": [
        "",
        "",
        "",
        ""
      ],
      "answer": "correct option like A, B, C, D"
    }
  ]
}`,
      variables: ['{language}', '{mainTopic}', '{subtopicsString}'],
      enabled: true
    },
    videoSearch: {
      name: 'Video Search Query',
      description: 'Generates search queries for finding relevant videos',
      template: `{subtopic} {mainTopic} in {language}`,
      variables: ['{subtopic}', '{mainTopic}', '{language}'],
      enabled: true
    }
  });

  const [aiModel, setAiModel] = useState({
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 4000,
    safetySettings: {
      harassment: 'BLOCK_MEDIUM_AND_ABOVE',
      hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
      sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
      dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  });

  const [testData, setTestData] = useState({
    language: 'English',
    mainTopic: 'JavaScript Programming',
    subtopic: 'Variables and Data Types',
    topicCount: '4',
    subtopics: 'Variables, Functions, Arrays, Objects'
  });

  useEffect(() => {
    console.log('AdminPromptSettings mounted, serverURL:', serverURL);
    fetchPromptSettings();
  }, []);

  const fetchPromptSettings = async () => {
    try {
      console.log('Fetching prompt settings from:', `${serverURL}/api/prompt-settings`);
      const response = await axios.get(`${serverURL}/api/prompt-settings`);
      console.log('Response received:', response.data);
      if (response.data.success) {
        setPrompts(response.data.prompts);
        setAiModel(response.data.aiModel);
      }
    } catch (error) {
      console.error('Error fetching prompt settings:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
      // Use default settings if API fails
    } finally {
      setLoading(false);
    }
  };

  const handlePromptChange = (promptKey, field, value) => {
    setPrompts(prev => ({
      ...prev,
      [promptKey]: {
        ...prev[promptKey],
        [field]: value
      }
    }));
  };

  const handleAiModelChange = (field, value) => {
    setAiModel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSafetySettingChange = (category, value) => {
    setAiModel(prev => ({
      ...prev,
      safetySettings: {
        ...prev.safetySettings,
        [category]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      console.log('Saving prompt settings to:', `${serverURL}/api/prompt-settings`);
      console.log('Data being sent:', { prompts, aiModel });
      const response = await axios.post(`${serverURL}/api/prompt-settings`, {
        prompts,
        aiModel
      });

      console.log('Save response:', response.data);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "AI prompt settings updated successfully",
        });
      }
    } catch (error) {
      console.error('Error saving prompt settings:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data
      });
      toast({
        title: "Error",
        description: "Failed to save prompt settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPrompts({
      courseStructure: {
        name: 'Course Structure Generation',
        description: 'Generates comprehensive course structure with logical progression and learning objectives',
        template: `Create a comprehensive, well-structured course outline for "{mainTopic}" in {language}.

Course Requirements:
- Generate exactly {topicCount} main topics
- Each topic should have 3-6 subtopics for optimal learning
- Include the following required topics: {subtopics}
- Create a logical learning progression from basic to advanced concepts
- Focus on practical, hands-on learning with real-world applications

Structure Guidelines:
1. Start with foundational concepts and build up to advanced topics
2. Each topic should have clear learning objectives
3. Include practical examples and exercises where appropriate
4. Ensure topics flow logically and build upon each other
5. Balance theory with practical application

Generate the response in this exact JSON format:
{
  "{mainTopic}": [
    {
      "title": "Topic Title (should be descriptive and engaging)",
      "subtopics": [
        {
          "title": "Subtopic Title (specific and actionable)",
          "theory": "",
          "youtube": "",
          "image": "",
          "done": false
        }
      ]
    }
  ]
}

Important Notes:
- Keep theory, youtube, and image fields empty (they will be populated later)
- Make topic and subtopic titles descriptive and engaging
- Ensure the course provides a complete learning path
- Focus on creating value for learners with practical skills`,
        variables: ['{language}', '{topicCount}', '{mainTopic}', '{subtopics}'],
        enabled: true
      },
      theoryContent: {
        name: 'Theory Content Generation',
        description: 'Generates comprehensive, well-structured learning content with practical examples',
        template: `Create a comprehensive, well-structured lesson about "{subtopic}" in {mainTopic} for {language} learners.

Content Structure Requirements:
1. Start with a clear introduction explaining what {subtopic} is and why it's important
2. Provide detailed explanations with practical examples
3. Include step-by-step breakdowns where applicable
4. Add common use cases and real-world applications
5. End with a brief summary of key points and best practices

Content Guidelines:
- Write in {language} with clear, engaging language
- Use proper HTML formatting with headings, paragraphs, and lists
- Include practical examples that learners can relate to
- Focus on being educational and actionable
- Avoid unnecessary jargon - explain complex concepts simply
- Make content interactive and engaging
- Include tips and best practices where relevant

Format the content with proper HTML tags:
- Use <h3> for section headings
- Use <p> for paragraphs
- Use <ul> and <li> for lists
- Use <strong> for emphasis
- Use <code> for code examples or technical terms

Focus on creating content that:
- Is easy to understand and follow
- Provides practical value
- Builds confidence in learners
- Prepares them for real-world application`,
        variables: ['{language}', '{mainTopic}', '{subtopic}'],
        enabled: true
      },
      imageGeneration: {
        name: 'Image Generation',
        description: 'Generates clear, educational images that illustrate concepts effectively',
        template: `Create a clear, professional visual example or diagram showing "{subtopic}" in {mainTopic}. The image should be educational, easy to understand, and visually appealing. Focus on illustrating the key concept in a way that helps learners understand the topic better.`,
        variables: ['{subtopic}', '{mainTopic}'],
        enabled: true
      },
      quizGeneration: {
        name: 'Quiz/Exam Generation',
        description: 'Generates comprehensive, well-balanced quizzes that test understanding effectively',
        template: `Create a comprehensive, well-structured MCQ quiz for "{mainTopic}" in {language}.

Quiz Requirements:
- Generate exactly 10 questions
- Cover all topics: {subtopicsString}
- Include at least one question per topic
- Create questions that test different levels of understanding (basic, intermediate, advanced)
- Ensure all options (A, B, C, D) are plausible and well-written

Question Guidelines:
1. Questions should be clear and unambiguous
2. Test practical understanding, not just memorization
3. Include scenario-based questions where appropriate
4. Mix question types: definition, application, analysis, synthesis
5. Ensure correct answers are not obvious from the question structure

Generate the response in this exact JSON format:
{
  "{mainTopic}": [
    {
      "topic": "Topic Title",
      "question": "Clear, well-written question that tests understanding",
      "options": [
        "Option A - plausible but incorrect",
        "Option B - plausible but incorrect", 
        "Option C - correct answer",
        "Option D - plausible but incorrect"
      ],
      "answer": "C"
    }
  ]
}

Important Notes:
- Make questions engaging and relevant to real-world application
- Ensure all options are of similar length and quality
- Avoid "all of the above" or "none of the above" options
- Focus on testing practical knowledge and problem-solving skills`,
        variables: ['{language}', '{mainTopic}', '{subtopicsString}'],
        enabled: true
      },
      videoSearch: {
        name: 'Video Search Query',
        description: 'Generates optimized search queries for finding high-quality educational videos',
        template: `educational tutorial {subtopic} {mainTopic} explained step by step in {language}`,
        variables: ['{subtopic}', '{mainTopic}', '{language}'],
        enabled: true
      },
      courseSummary: {
        name: 'Course Summary Generation',
        description: 'Generates comprehensive course summaries and learning objectives',
        template: `Create a comprehensive course summary and learning objectives for "{mainTopic}" in {language}.

Summary Requirements:
1. Course Overview: Brief introduction to what the course covers
2. Learning Objectives: 5-7 clear, measurable learning outcomes
3. Target Audience: Who this course is designed for
4. Prerequisites: What learners should know before starting
5. Course Benefits: What learners will gain from completing this course
6. Key Takeaways: Main skills and knowledge they'll acquire

Format Guidelines:
- Write in {language} with clear, professional language
- Use bullet points for easy reading
- Focus on practical benefits and real-world applications
- Make objectives specific and measurable
- Keep the tone engaging and motivating

Structure the response with clear sections:
- Course Overview
- Learning Objectives  
- Target Audience
- Prerequisites
- Course Benefits
- Key Takeaways

Focus on creating a summary that:
- Motivates learners to start the course
- Clearly communicates what they'll learn
- Sets appropriate expectations
- Highlights the practical value`,
        variables: ['{language}', '{mainTopic}'],
        enabled: true
      }
    });

    setAiModel({
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxTokens: 4000,
      safetySettings: {
        harassment: 'BLOCK_MEDIUM_AND_ABOVE',
        hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
        sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
        dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    });

    toast({
      title: "Reset Complete",
      description: "All prompts have been reset to default values",
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Prompt template copied to clipboard",
    });
  };

  const generatePreview = (promptKey) => {
    let template = prompts[promptKey].template;
    
    // Replace variables with test data
    template = template.replace(/{language}/g, testData.language);
    template = template.replace(/{mainTopic}/g, testData.mainTopic);
    template = template.replace(/{subtopic}/g, testData.subtopic);
    template = template.replace(/{topicCount}/g, testData.topicCount);
    template = template.replace(/{subtopics}/g, testData.subtopics);
    template = template.replace(/{subtopicsString}/g, testData.subtopics);
    
    return template;
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold leading-none">AI Prompt Settings</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold leading-none">AI Prompt Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage and customize AI prompts used for course generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prompts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Prompt Templates
          </TabsTrigger>
          <TabsTrigger value="model" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            AI Model Settings
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Test & Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-6">
          {Object.entries(prompts).map(([key, prompt]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {prompt.name}
                    </CardTitle>
                    <CardDescription>{prompt.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={prompt.enabled}
                      onCheckedChange={(checked) => handlePromptChange(key, 'enabled', checked)}
                    />
                    <Badge variant={prompt.enabled ? "default" : "secondary"}>
                      {prompt.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Available Variables</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prompt.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Prompt Template</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(prompt.template)}
                      className="h-8 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Textarea
                    value={prompt.template}
                    onChange={(e) => handlePromptChange(key, 'template', e.target.value)}
                    placeholder="Enter prompt template..."
                    className="font-mono text-sm"
                    rows={8}
                  />
                </div>

                {previewMode && (
                  <div>
                    <Label className="text-sm font-medium">Preview with Test Data</Label>
                    <div className="mt-2 p-4 bg-muted rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">{generatePreview(key)}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="model" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI Model Configuration
              </CardTitle>
              <CardDescription>
                Configure the AI model parameters and safety settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">AI Model</Label>
                  <Select value={aiModel.model} onValueChange={(value) => handleAiModelChange('model', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                      <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                      <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Temperature</Label>
                  <Input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={aiModel.temperature}
                    onChange={(e) => handleAiModelChange('temperature', parseFloat(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Controls randomness (0 = deterministic, 2 = very random)
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Max Tokens</Label>
                  <Input
                    type="number"
                    min="1000"
                    max="8000"
                    step="1000"
                    value={aiModel.maxTokens}
                    onChange={(e) => handleAiModelChange('maxTokens', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium mb-4 block">Safety Settings</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(aiModel.safetySettings).map(([category, value]) => (
                    <div key={category}>
                      <Label className="text-sm font-medium capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Select value={value} onValueChange={(newValue) => handleSafetySettingChange(category, newValue)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BLOCK_NONE">Allow All</SelectItem>
                          <SelectItem value="BLOCK_LOW_AND_ABOVE">Block Low and Above</SelectItem>
                          <SelectItem value="BLOCK_MEDIUM_AND_ABOVE">Block Medium and Above</SelectItem>
                          <SelectItem value="BLOCK_HIGH_AND_ABOVE">Block High and Above</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Data Configuration
              </CardTitle>
              <CardDescription>
                Configure test data to preview how prompts will look with real values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Language</Label>
                  <Input
                    value={testData.language}
                    onChange={(e) => setTestData(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="e.g., English"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Main Topic</Label>
                  <Input
                    value={testData.mainTopic}
                    onChange={(e) => setTestData(prev => ({ ...prev, mainTopic: e.target.value }))}
                    placeholder="e.g., JavaScript Programming"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Subtopic</Label>
                  <Input
                    value={testData.subtopic}
                    onChange={(e) => setTestData(prev => ({ ...prev, subtopic: e.target.value }))}
                    placeholder="e.g., Variables and Data Types"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Topic Count</Label>
                  <Input
                    value={testData.topicCount}
                    onChange={(e) => setTestData(prev => ({ ...prev, topicCount: e.target.value }))}
                    placeholder="e.g., 4"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Subtopics (comma-separated)</Label>
                  <Input
                    value={testData.subtopics}
                    onChange={(e) => setTestData(prev => ({ ...prev, subtopics: e.target.value }))}
                    placeholder="e.g., Variables, Functions, Arrays, Objects"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {previewMode && (
            <div className="space-y-4">
              {Object.entries(prompts).map(([key, prompt]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{prompt.name} - Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-muted rounded-md">
                      <pre className="text-sm whitespace-pre-wrap">{generatePreview(key)}</pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPromptSettings; 