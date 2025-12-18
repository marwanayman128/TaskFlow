'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  locale: string;
}

// Features data
const FEATURES = [
  {
    icon: 'solar:calendar-bold-duotone',
    title: 'Smart Scheduling',
    description: 'Organize your day with intelligent task scheduling and calendar integration.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: 'solar:checklist-minimalistic-bold-duotone',
    title: 'Task Management',
    description: 'Create, organize, and track tasks with lists, boards, and powerful filters.',
    color: 'from-purple-500 to-pink-400',
  },
  {
    icon: 'solar:bell-bold-duotone',
    title: 'Smart Reminders',
    description: 'Never miss a deadline with location-based and time-based reminders.',
    color: 'from-orange-500 to-yellow-400',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Team Collaboration',
    description: 'Share lists, assign tasks, and collaborate with your team in real-time.',
    color: 'from-green-500 to-emerald-400',
  },
  {
    icon: 'solar:widget-4-bold-duotone',
    title: 'Multiple Views',
    description: 'Switch between Kanban boards, list views, and calendar for your workflow.',
    color: 'from-red-500 to-rose-400',
  },
  {
    icon: 'solar:magic-stick-3-bold-duotone',
    title: 'AI Assistant',
    description: 'Get smart suggestions and automate repetitive tasks with AI.',
    color: 'from-indigo-500 to-violet-400',
  },
];

// Stats data
const STATS = [
  { value: '1M+', label: 'Active Users' },
  { value: '50M+', label: 'Tasks Completed' },
  { value: '4.9★', label: 'App Store Rating' },
  { value: '99.9%', label: 'Uptime' },
];

// Testimonials
const TESTIMONIALS = [
  {
    content: "TaskFlow has completely transformed how I organize my work. It's the perfect balance of power and simplicity.",
    author: 'Sarah Johnson',
    role: 'Product Designer at Google',
    avatar: 'SJ',
  },
  {
    content: 'The best task management app I\'ve ever used. The Kanban view and calendar integration are game-changers.',
    author: 'Michael Chen',
    role: 'Engineering Manager at Meta',
    avatar: 'MC',
  },
  {
    content: "Finally, an app that understands how I work. The AI features save me hours every week.",
    author: 'Emily Rodriguez',
    role: 'Startup Founder',
    avatar: 'ER',
  },
];

export function LandingPage({ locale }: LandingPageProps) {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <motion.div
          className="absolute top-0 left-1/4 size-[600px] rounded-full bg-primary/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 size-[500px] rounded-full bg-purple-500/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <Icon icon="solar:checklist-minimalistic-bold" className="size-6 text-white" />
            </div>
            <span className="text-xl font-bold">TaskFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}>
              <Button variant="ghost" className="hidden sm:flex">Sign In</Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Icon icon="solar:star-bold" className="size-4" />
                #1 Task Management App
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Organize your life.{' '}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                  Achieve more.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                The all-in-one task manager that helps you capture ideas, organize work, and hit your goals. 
                Join millions who stay on top of their day with TaskFlow.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={`/${locale}/register`}>
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-gradient-to-r from-primary to-primary/80 shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-shadow">
                    Start for Free
                    <Icon icon="solar:arrow-right-linear" className="size-5 ml-2" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto h-14 px-8 text-base"
                >
                  <Icon icon="solar:play-circle-bold" className="size-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 mt-10 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['👩‍💻', '👨‍🎨', '👩‍🔬', '👨‍💼', '👩‍🏫'].map((emoji, i) => (
                    <div key={i} className="size-10 rounded-full bg-muted flex items-center justify-center text-lg border-2 border-background">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon key={star} icon="solar:star-bold" className="size-4 text-yellow-500" />
                    ))}
                  </div>
                  <p className="text-muted-foreground">Loved by 1M+ users</p>
                </div>
              </div>
            </motion.div>

            {/* Hero Image/Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl p-8 backdrop-blur-xl border shadow-2xl">
                {/* Mock Task List */}
                <div className="space-y-3">
                  {[
                    { title: 'Review product roadmap', tag: 'Work', completed: true },
                    { title: 'Prepare presentation slides', tag: 'Priority', completed: false },
                    { title: 'Meet with design team', tag: 'Meeting', completed: false },
                    { title: 'Write weekly report', tag: 'Work', completed: false },
                  ].map((task, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className={cn(
                        "flex items-center gap-3 p-4 bg-card rounded-xl shadow-sm border",
                        task.completed && "opacity-60"
                      )}
                    >
                      <div className={cn(
                        "size-6 rounded-full border-2 flex items-center justify-center transition-colors",
                        task.completed ? "border-primary bg-primary" : "border-muted-foreground/30"
                      )}>
                        {task.completed && (
                          <Icon icon="solar:check-read-linear" className="size-4 text-white" />
                        )}
                      </div>
                      <span className={cn("flex-1", task.completed && "line-through")}>{task.title}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        task.tag === 'Priority' ? "bg-red-500/10 text-red-500" :
                        task.tag === 'Meeting' ? "bg-blue-500/10 text-blue-500" :
                        "bg-primary/10 text-primary"
                      )}>
                        {task.tag}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✓ Task Completed!
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                stay organized
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks, collaborate with team, and achieve your goals.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn(
                  "size-14 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg",
                  feature.color
                )}>
                  <Icon icon={feature.icon} className="size-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Loved by{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                thousands
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users have to say about TaskFlow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border shadow-sm"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon key={star} icon="solar:star-bold" className="size-5 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-primary via-blue-500 to-purple-500 text-white text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent)]" />
            
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/80 mb-8 relative max-w-xl mx-auto">
              Join over 1 million people who use TaskFlow to organize their work and life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <Link href={`/${locale}/register`}>
                <Button size="lg" className="h-14 px-8 text-base bg-white text-primary hover:bg-white/90 shadow-xl">
                  Get Started for Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Icon icon="solar:checklist-minimalistic-bold" className="size-5 text-white" />
              </div>
              <span className="font-semibold">TaskFlow</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
