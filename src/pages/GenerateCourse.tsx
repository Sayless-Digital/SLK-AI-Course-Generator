import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Plus, X, BookOpen, Video, Image, Globe, Target, Zap } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CoursePreview from '@/components/CoursePreview';
import SEO from '@/components/SEO';
import { useToast } from '@/hooks/use-toast';
import { serverURL } from '@/constants';
import axios from 'axios';

const courseFormSchema = z.object({
  topic: z.string().min(3, { message: "Topic must be at least 3 characters" }),
  subtopics: z.array(z.string()),
  topicsLimit: z.enum(["4", "8"]),
  courseType: z.enum(["Text & Image Course", "Video & Text Course"]),
  language: z.string().min(1, { message: "Please select a language" })
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

const GenerateCourse = () => {
  const [subtopicInput, setSubtopicInput] = useState('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTopics, setGeneratedTopics] = useState({});
  const [userPlanLimits, setUserPlanLimits] = useState({
    maxSubtopics: 5,
    maxTopics: 4,
    courseTypes: ["Text & Image Course"],
    languages: ["English"],
    unlimitedCourses: false,
    aiTeacherChat: true,
    videoCourses: false,
    theoryCourses: true,
    imageCourses: true
  });
  const [selectedValue, setSelectedValue] = useState('4');
  const [selectedType, setSelectedType] = useState('Text & Image Course');
  const [paidMember, setPaidMember] = useState(false);
  const [lang, setLang] = useState('English');
  const { toast } = useToast();

  const languages = [
    { "code": "en", "name": "English" },
    { "code": "ar", "name": "Arabic" },
    { "code": "bn", "name": "Bengali" },
    { "code": "bg", "name": "Bulgarian" },
    { "code": "zh", "name": "Chinese" },
    { "code": "hr", "name": "Croatian" },
    { "code": "cs", "name": "Czech" },
    { "code": "da", "name": "Danish" },
    { "code": "nl", "name": "Dutch" },
    { "code": "et", "name": "Estonian" },
    { "code": "fi", "name": "Finnish" },
    { "code": "fr", "name": "French" },
    { "code": "de", "name": "German" },
    { "code": "el", "name": "Greek" },
    { "code": "he", "name": "Hebrew" },
    { "code": "hi", "name": "Hindi" },
    { "code": "hu", "name": "Hungarian" },
    { "code": "id", "name": "Indonesian" },
    { "code": "it", "name": "Italian" },
    { "code": "ja", "name": "Japanese" },
    { "code": "ko", "name": "Korean" },
    { "code": "lv", "name": "Latvian" },
    { "code": "lt", "name": "Lithuanian" },
    { "code": "no", "name": "Norwegian" },
    { "code": "pl", "name": "Polish" },
    { "code": "pt", "name": "Portuguese" },
    { "code": "ro", "name": "Romanian" },
    { "code": "ru", "name": "Russian" },
    { "code": "sr", "name": "Serbian" },
    { "code": "sk", "name": "Slovak" },
    { "code": "sl", "name": "Slovenian" },
    { "code": "es", "name": "Spanish" },
    { "code": "sw", "name": "Swahili" },
    { "code": "sv", "name": "Swedish" },
    { "code": "th", "name": "Thai" },
    { "code": "tr", "name": "Turkish" },
    { "code": "uk", "name": "Ukrainian" },
    { "code": "vi", "name": "Vietnamese" }
  ];

  useEffect(() => {
    fetchUserPlanLimits();
    
    if (sessionStorage.getItem('type') !== 'free') {
      setPaidMember(true);
    }
  }, []);

  const fetchUserPlanLimits = async () => {
    try {
      // Use the currently logged-in user's ID
      const userId = sessionStorage.getItem('uid');
      if (!userId) {
        console.error('No user ID found in session storage');
        return;
      }
      console.log('Using current user ID:', userId);

      console.log('Sending request to /api/user-plan-limits with userId:', userId);
      const response = await axios.post(`${serverURL}/api/user-plan-limits`, {
        userId
      });

      if (response.data.success) {
        const limits = response.data.limits;
        setUserPlanLimits(limits);
        
        // Update form defaults based on plan limits
        setSelectedValue(limits.maxTopics.toString());
        setSelectedType(limits.courseTypes[0] || "Text & Image Course");
        setLang(limits.languages[0] || "English");
        
        // Update form default values
        form.setValue('topicsLimit', limits.maxTopics.toString());
        form.setValue('courseType', limits.courseTypes[0] || "Text & Image Course");
        form.setValue('language', limits.languages[0] || "English");
      }
    } catch (error) {
      console.error('Error fetching user plan limits:', error);
    }
  };

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      topic: '',
      subtopics: [],
      topicsLimit: "4",
      courseType: "Text & Image Course",
      language: "English"
    }
  });

  const paidToad = () => {
    if (!paidMember) {
      toast({
        title: "Go Premium",
        description: "Access all features with a Premium upgrade."
      });
    }
  };

  const addSubtopic = () => {
    if (subtopics.length < userPlanLimits.maxSubtopics) {
      if (subtopicInput.trim() === '') return;
      setSubtopics([...subtopics, subtopicInput.trim()]);
      setSubtopicInput('');
      form.setValue('subtopics', [...subtopics, subtopicInput.trim()]);
    } else {
      toast({
        title: "Plan Limit Reached",
        description: `You are limited to adding only ${userPlanLimits.maxSubtopics} subtopics with your current plan.`
      });
    }
  };

  const onSubmit = async (data: CourseFormValues) => {
    setIsLoading(true);
    setIsSubmitted(true);

    const subtopics = [];
    data.subtopics.forEach(subtopic => {
      subtopics.push(subtopic);
    });

    const mainTopic = data.topic;
    const lang = data.language;
    const number = data.topicsLimit;

    const prompt = `Strictly in ${lang}, Generate a list of Strict ${number} topics and any number sub topic for each topic for main title ${mainTopic.toLowerCase()}, everything in single line. Those ${number} topics should Strictly include these topics :- ${subtopics.join(', ').toLowerCase()}. Strictly Keep theory, youtube, image field empty. Generate in the form of JSON in this format {
            "${mainTopic.toLowerCase()}": [
       {
       "title": "Topic Title",
       "subtopics": [
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        },
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        }
       ]
       },
       {
       "title": "Topic Title",
       "subtopics": [
        {
        "title": "Sub Topic Title",
        "theory": "",
        "youtube": "",
        "image": "",
        "done": false
        },
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
      }`;

    sendPrompt(prompt);
  };

  async function sendPrompt(prompt: string) {
    const dataToSend = {
      prompt: prompt,
    };
    try {
      const postURL = serverURL + '/api/prompt';
      const res = await axios.post(postURL, dataToSend);
      const generatedText = res.data.generatedText;
      const cleanedJsonString = generatedText.replace(/```json/g, '').replace(/```/g, '');
      try {
        const parsedJson = JSON.parse(cleanedJsonString);
        setGeneratedTopics(parsedJson)
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Internal Server Error",
        });
      }

    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Internal Server Error",
      });
    }
  }

  const handleEditTopics = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <>
        <SEO
          title="Generate Course - Preview"
          description="Preview your AI-generated course before creation"
          keywords="course generation, preview, AI learning"
        />
        <CoursePreview
          isLoading={isLoading}
          courseName={form.getValues('topic').toLowerCase()}
          topics={generatedTopics}
          type={selectedType}
          lang={lang.toLowerCase()}
          onClose={handleEditTopics}
        />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Generate Course"
        description="Create a customized AI-generated course"
        keywords="course generation, AI learning, custom education"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Generate Your Course
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Create a personalized AI-generated course tailored to your learning needs. 
              Simply enter your topic and let our AI build a comprehensive learning experience.
            </p>
          </div>

          {/* Plan Limits Info */}
          {!paidMember && (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Free Plan Limits</p>
                    <p className="text-xs text-muted-foreground">
                      {userPlanLimits.maxTopics} topics • {userPlanLimits.maxSubtopics} subtopics • {userPlanLimits.languages.length} language{userPlanLimits.languages.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={paidToad}>
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Main Topic Section */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Course Topic
                  </CardTitle>
                  <CardDescription>
                    Enter the main subject you want to learn about
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Main Topic</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., JavaScript Programming, Digital Marketing, Photography" 
                            className="h-12 text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about what you want to learn
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Subtopics Section */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Specific Topics (Optional)
                  </CardTitle>
                  <CardDescription>
                    Add specific subtopics you want to include in your course
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Variables, Functions, Arrays"
                      value={subtopicInput}
                      onChange={(e) => setSubtopicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubtopic();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addSubtopic}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  {subtopics.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Added Topics ({subtopics.length}/{userPlanLimits.maxSubtopics})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {subtopics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {topic}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                const newSubtopics = subtopics.filter((_, i) => i !== index);
                                setSubtopics(newSubtopics);
                                form.setValue('subtopics', newSubtopics);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Course Configuration Section */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Course Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your course settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Number of Topics */}
                  <div>
                    <FormLabel className="text-base font-medium">Number of Topics</FormLabel>
                    <FormField
                      control={form.control}
                      name="topicsLimit"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormControl>
                            <RadioGroup
                              value={selectedValue}
                              onValueChange={(selectedValue) => {
                                setSelectedValue(selectedValue);
                                field.onChange(selectedValue);
                              }}
                              className="grid grid-cols-2 gap-3"
                            >
                              {userPlanLimits.maxTopics >= 4 && (
                                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                  <RadioGroupItem value="4" id="r1" />
                                  <div className="flex-1">
                                    <FormLabel htmlFor="r1" className="text-base font-medium cursor-pointer">4 Topics</FormLabel>
                                    <p className="text-sm text-muted-foreground">Standard course length</p>
                                  </div>
                                </div>
                              )}
                              {userPlanLimits.maxTopics >= 8 && (
                                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                  <RadioGroupItem value="8" id="r2" />
                                  <div className="flex-1">
                                    <FormLabel htmlFor="r2" className="text-base font-medium cursor-pointer">8 Topics</FormLabel>
                                    <p className="text-sm text-muted-foreground">Comprehensive course</p>
                                  </div>
                                </div>
                              )}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Course Type */}
                  <div>
                    <FormLabel className="text-base font-medium">Course Type</FormLabel>
                    <FormField
                      control={form.control}
                      name="courseType"
                      render={({ field }) => (
                        <FormItem className="mt-3">
                          <FormControl>
                            <RadioGroup
                              value={selectedType}
                              onValueChange={(selectedValue) => {
                                setSelectedType(selectedValue);
                                field.onChange(selectedValue);
                              }}
                              className="grid grid-cols-1 gap-3"
                            >
                              {userPlanLimits.courseTypes.includes("Text & Image Course") && (
                                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                  <RadioGroupItem value="Text & Image Course" id="ct1" />
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Image className="h-5 w-5 text-blue-500" />
                                      <BookOpen className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                      <FormLabel htmlFor="ct1" className="text-base font-medium cursor-pointer">Text & Image Course</FormLabel>
                                      <p className="text-sm text-muted-foreground">Learn with written content and visual examples</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {userPlanLimits.courseTypes.includes("Video & Text Course") && (
                                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                                  <RadioGroupItem value="Video & Text Course" id="ct2" />
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                      <Video className="h-5 w-5 text-red-500" />
                                      <BookOpen className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                      <FormLabel htmlFor="ct2" className="text-base font-medium cursor-pointer">Video & Text Course</FormLabel>
                                      <p className="text-sm text-muted-foreground">Learn with video lessons and written explanations</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Language Selection */}
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Course Language</FormLabel>
                        <Select onValueChange={(selectedValue) => {
                          setLang(selectedValue);
                          field.onChange(selectedValue);
                        }} value={lang}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages
                              .filter(country => userPlanLimits.languages.includes(country.name))
                              .map((country) => (
                                <SelectItem key={country.code} value={country.name}>
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    {country.name}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the language for your course content
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating Course...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate My Course
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

export default GenerateCourse;