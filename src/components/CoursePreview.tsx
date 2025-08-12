
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader, ArrowLeft, BookOpen, Target, Sparkles, Play, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { serverURL } from '@/constants';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';


interface CoursePreviewProps {
    isLoading: boolean;
    courseName: string;
    topics: unknown,
    type: string,
    lang: string,
    onClose?: () => void;
}

const CoursePreview: React.FC<CoursePreviewProps> = ({
    isLoading,
    courseName,
    topics,
    type,
    lang,
    onClose,
}) => {
    const navigate = useNavigate();
    const [isLoadingCourse, setIsLoadingCourse] = useState(false);
    const { toast } = useToast();

    function handleCreateCourse() {
        // Check if topics data exists and has the required structure
        if (!topics || !topics[courseName.toLowerCase()] || !Array.isArray(topics[courseName.toLowerCase()]) || topics[courseName.toLowerCase()].length === 0) {
            toast({
                title: "Error",
                description: "No course data available to generate",
            });
            return;
        }

        const mainTopicData = topics[courseName.toLowerCase()][0];
        
        if (!mainTopicData || !mainTopicData.subtopics || !Array.isArray(mainTopicData.subtopics) || mainTopicData.subtopics.length === 0) {
            toast({
                title: "Error",
                description: "No subtopics available to generate",
            });
            return;
        }

        const firstSubtopic = mainTopicData.subtopics[0];

        if (type === 'Video & Text Course') {

            const query = `${firstSubtopic.title} ${courseName} in english`;
            sendVideo(query, firstSubtopic.title);
            setIsLoadingCourse(true);

        } else {

            const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${firstSubtopic.title}. Please Strictly Don't Give Additional Resources And Images.`;
            const promptImage = `Example of ${firstSubtopic.title} in ${courseName}`;
            setIsLoadingCourse(true);
            sendPrompt(prompt, promptImage);

        }

    }

    async function sendPrompt(prompt, promptImage) {
        const dataToSend = {
            prompt: prompt,
        };
        try {
            const postURL = serverURL + '/api/generate';
            const res = await axios.post(postURL, dataToSend);
            const generatedText = res.data.text;
            const htmlContent = generatedText;

            try {
                const parsedJson = htmlContent;
                sendImage(parsedJson, promptImage);
            } catch (error) {
                setIsLoadingCourse(false);
                console.error(error);
                toast({
                    title: "Error",
                    description: "Internal Server Error",
                });
            }

        } catch (error) {
            setIsLoadingCourse(false);
            console.error(error);
            toast({
                title: "Error",
                description: "Internal Server Error",
            });
        }
    }

    async function sendImage(parsedJson, promptImage) {
        const dataToSend = {
            prompt: promptImage,
        };
        try {
            const postURL = serverURL + '/api/image';
            const res = await axios.post(postURL, dataToSend);
            try {
                const generatedText = res.data.url;
                sendData(generatedText, parsedJson);
                setIsLoadingCourse(false);
            } catch (error) {
                setIsLoadingCourse(false);
                console.error(error);
                toast({
                    title: "Error",
                    description: "Internal Server Error",
                });
            }

        } catch (error) {
            setIsLoadingCourse(false);
            console.error(error);
            toast({
                title: "Error",
                description: "Internal Server Error",
            });
        }
    }

    async function sendData(image, theory) {
        topics[courseName.toLowerCase()][0].subtopics[0].theory = theory;
        topics[courseName.toLowerCase()][0].subtopics[0].image = image;

        // Use the currently logged-in user's ID
        const user = sessionStorage.getItem('uid');
        if (!user) {
            setIsLoadingCourse(false);
            toast({
                title: "Error",
                description: "User not logged in. Please log in again.",
            });
            return;
        }
        const content = JSON.stringify(topics);
        const postURL = serverURL + '/api/course';
        const response = await axios.post(postURL, { user, content, type, mainTopic: courseName, lang });

        if (response.data.success) {
            sessionStorage.setItem('courseId', response.data.courseId);
            sessionStorage.setItem('first', response.data.completed);
            sessionStorage.setItem('jsonData', JSON.stringify(topics));
            navigate('/course/' + response.data.courseId, {
                state: {
                    jsonData: topics,
                    mainTopic: courseName.toUpperCase(),
                    type: type.toLowerCase(),
                    courseId: response.data.courseId,
                    end: '',
                    pass: false,
                    lang: lang
                }
            });
        } else {
            setIsLoadingCourse(false);
            toast({
                title: "Error",
                description: "Internal Server Error",
            });
        }

    }

    async function sendDataVideo(image, theory) {
        topics[courseName.toLowerCase()][0].subtopics[0].theory = theory;
        topics[courseName.toLowerCase()][0].subtopics[0].youtube = image;

        // Use the currently logged-in user's ID
        const user = sessionStorage.getItem('uid');
        if (!user) {
            setIsLoadingCourse(false);
            toast({
                title: "Error",
                description: "User not logged in. Please log in again.",
            });
            return;
        }
        const content = JSON.stringify(topics);
        const postURL = serverURL + '/api/course';
        const response = await axios.post(postURL, { user, content, type, mainTopic: courseName, lang });

        if (response.data.success) {
            sessionStorage.setItem('courseId', response.data.courseId);
            sessionStorage.setItem('first', response.data.completed);
            sessionStorage.setItem('jsonData', JSON.stringify(topics));
            navigate('/course/' + response.data.courseId, {
                state: {
                    jsonData: topics,
                    mainTopic: courseName.toUpperCase(),
                    type: type.toLowerCase(),
                    courseId: response.data.courseId,
                    end: '',
                    pass: false,
                    lang: lang
                }
            });
        } else {
            setIsLoadingCourse(false);
            toast({
                title: "Error",
                description: "Internal Server Error",
            });
        }

    }

    async function sendVideo(query, subtopic) {
        const dataToSend = {
            prompt: query,
        };
        try {
            const postURL = serverURL + '/api/yt';
            const res = await axios.post(postURL, dataToSend);
            try {
                const generatedText = res.data.url;
                sendTranscript(generatedText, subtopic);
            } catch (error) {
                setIsLoadingCourse(false);
                console.error(error);
                toast({
                    title: "Error",
                    description: "Internal Server Error",
                });
            }

        } catch (error) {
            setIsLoadingCourse(false);
            console.error(error);
            toast({
                title: "Error",
                description: "Internal Server Error",
            });
        }
    }

    async function sendTranscript(url, subtopic) {
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
                const prompt = `Strictly in ${lang}, Summarize this theory in a teaching way and :- ${concatenatedText}.`;
                sendSummery(prompt, url);
            } catch (error) {
                const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;
                sendSummery(prompt, url);
            }

        } catch (error) {
            const prompt = `Strictly in ${lang}, Explain me about this subtopic of ${courseName} with examples :- ${subtopic}. Please Strictly Don't Give Additional Resources And Images.`;
            sendSummery(prompt, url);
        }
    }

    async function sendSummery(prompt, url) {
        const dataToSend = {
            prompt: prompt,
        };
        try {
            const postURL = serverURL + '/api/generate';
            const res = await axios.post(postURL, dataToSend);
            const generatedText = res.data.text;
            const htmlContent = generatedText;

            try {
                const parsedJson = htmlContent;
                setIsLoadingCourse(false);
                sendDataVideo(url, parsedJson);
            } catch (error) {
                setIsLoadingCourse(false);
                console.error(error);
                toast({
                    title: "Error",
                    description: "Internal Server Error",
                });
            }

        } catch (error) {
            setIsLoadingCourse(false);
            console.error(error);
            toast({
                title: "Error",
                description: "Internal Server Error",
            });
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <Loader className="h-8 w-8 text-primary animate-spin" />
                        </div>
                        <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
                        <Skeleton className="h-4 w-full max-w-lg mx-auto" />
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3, 4].map((section) => (
                            <Card key={section} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                                <CardHeader>
                                    <Skeleton className="h-6 w-1/3" />
                                    <Skeleton className="h-4 w-2/3" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="flex items-center gap-3 p-3 border rounded-lg">
                                            <Skeleton className="h-4 w-4 rounded-full" />
                                            <Skeleton className="h-4 flex-1" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <div className="flex items-center justify-center gap-2 text-primary">
                            <Loader className="animate-spin h-5 w-5" />
                            <span className="font-medium">Generating your course structure...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const renderTopicsAndSubtopics = (topicss) => {
        if (!topicss || !Array.isArray(topicss)) {
            return (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Course Data</h3>
                    <p className="text-muted-foreground">No course structure available to display</p>
                </div>
            );
        }
        
        return (
            <div className="space-y-6">
                {topicss.map((topic, index) => (
                    <Card key={index} className="border-0 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                                        <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-foreground">
                                            {topic.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm text-muted-foreground">
                                            {topic.subtopics?.length || 0} subtopics
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    Module {index + 1}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {topic.subtopics && Array.isArray(topic.subtopics) && (
                                <div className="divide-y divide-border/50">
                                    {topic.subtopics.map((subtopic, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-4 hover:bg-accent/30 transition-colors">
                                            <div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full flex-shrink-0">
                                                <span className="text-xs font-medium text-muted-foreground">{idx + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {subtopic.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {type === 'Video & Text Course' ? (
                                                        <div className="flex items-center gap-1">
                                                            <Play className="h-3 w-3 text-red-500" />
                                                            <span className="text-xs text-muted-foreground">Video Lesson</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <ImageIcon className="h-3 w-3 text-blue-500" />
                                                            <span className="text-xs text-muted-foreground">Visual Example</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <BookOpen className="h-3 w-3 text-green-500" />
                                                        <span className="text-xs text-muted-foreground">Theory</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const totalTopics = topics && topics[courseName.toLowerCase()] ? topics[courseName.toLowerCase()].length : 0;
    const totalSubtopics = topics && topics[courseName.toLowerCase()] ? 
        topics[courseName.toLowerCase()].reduce((acc, topic) => acc + (topic.subtopics?.length || 0), 0) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {courseName.toUpperCase()}
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                        Preview your course structure before generation
                    </p>
                </div>

                {/* Course Stats */}
                <Card className="mb-6 border-primary/20 bg-primary/5">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">{totalTopics}</div>
                                <div className="text-sm text-muted-foreground">Main Topics</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">{totalSubtopics}</div>
                                <div className="text-sm text-muted-foreground">Subtopics</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">{type}</div>
                                <div className="text-sm text-muted-foreground">Course Type</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Course Structure */}
                <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Course Structure
                        </CardTitle>
                        <CardDescription>
                            Review the topics and subtopics that will be covered in your course
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                            {topics && topics[courseName.toLowerCase()] ? 
                                renderTopicsAndSubtopics(topics[courseName.toLowerCase()]) :
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No Course Data</h3>
                                    <p className="text-muted-foreground">No course structure available to display</p>
                                </div>
                            }
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        disabled={isLoadingCourse}
                        variant="outline"
                        onClick={onClose}
                        className="flex items-center gap-2 h-12 px-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Edit
                    </Button>
                    <Button
                        disabled={isLoadingCourse}
                        onClick={handleCreateCourse}
                        className="flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                    >
                        {isLoadingCourse ? (
                            <>
                                <Loader className="animate-spin h-4 w-4" />
                                Generating Course...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4" />
                                Generate Course
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CoursePreview;