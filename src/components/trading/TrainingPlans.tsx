
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Target, TrendingUp, BookOpen, Users } from 'lucide-react';

interface TrainingPlan {
  id: number;
  title: string;
  description: string;
  progress: number;
  completed: boolean;
}

const TrainingPlans = () => {
  const [plans] = useState<TrainingPlan[]>([
    {
      id: 1,
      title: 'Options Trading Basics',
      description: 'Learn the fundamentals of options trading',
      progress: 75,
      completed: false,
    },
    {
      id: 2,
      title: 'Technical Analysis',
      description: 'Master technical analysis for stock trading',
      progress: 50,
      completed: false,
    },
    {
      id: 3,
      title: 'Risk Management',
      description: 'Understand and manage trading risks',
      progress: 100,
      completed: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trading Training Plans</h1>
          <p className="text-gray-600">Enhance your trading skills with structured training</p>
        </div>
        <Button variant="outline">
          <BookOpen className="h-4 w-4 mr-2" />
          View All Courses
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active Plans</TabsTrigger>
          <TabsTrigger value="completed">Completed Plans</TabsTrigger>
          <TabsTrigger value="community">Community Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Active Training Plans</CardTitle>
              <CardDescription>
                Continue your learning journey with these active plans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plans.filter(plan => !plan.completed).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No active training plans</p>
                    <p className="text-sm">Start a new plan to enhance your skills</p>
                  </div>
                ) : (
                  plans
                    .filter(plan => !plan.completed)
                    .map(plan => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-semibold text-lg">{plan.title}</h3>
                            <Badge variant="outline">In Progress</Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            Continue
                          </Button>
                        </div>

                        <p className="text-sm text-gray-600">{plan.description}</p>

                        <div className="mt-3">
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Progress</span>
                            <span>{plan.progress}%</span>
                          </div>
                          <Progress value={plan.progress} className="h-2" />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Training Plans</CardTitle>
              <CardDescription>
                Review your completed training plans and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plans.filter(plan => plan.completed).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed training plans</p>
                  <p className="text-sm">Complete a plan to earn achievements</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plans
                    .filter(plan => plan.completed)
                    .map(plan => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <h3 className="font-semibold text-lg">{plan.title}</h3>
                          </div>
                          <Badge variant="default">Completed</Badge>
                        </div>

                        <p className="text-sm text-gray-600">{plan.description}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Community Learning
              </CardTitle>
              <CardDescription>
                Share and learn from other traders in the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No community learning resources available yet</p>
                <p className="text-sm">Contribute to the community to unlock more resources</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrainingPlans;
