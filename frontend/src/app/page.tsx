//HOME PAGE - KUBE AERIAL INTELLIGENCE 
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import {
  Rocket, Brain, Cloud, Smartphone, Shield, Zap,
  ChevronRight, Camera, Wifi, Cpu, Server, Radio, Activity,
  MapPin, TreePine, Leaf, Mountain, Users, Play
} from 'lucide-react'

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
      {/* Premium Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-primary-100/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow-blue transition-all">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  KUBE
                </span>
                <div className="text-xs text-primary-600 font-medium -mt-1">Aerial Intelligence</div>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">How It Works</a>
              <a href="#use-cases" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Use Cases</a>
              <a href="#technology" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">Technology</a>
              <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-gradient-ocean text-white rounded-xl font-medium shadow-lg hover:shadow-glow-blue transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Horizontal Sliding Images */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Images - Horizontal Sliding Carousel */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Dark Ocean Blue Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/85 to-primary-700/80 z-10" />

          {/* Horizontal Sliding Images Container */}
          <motion.div
            animate={{
              x: ['-20%', '-100%']
            }}
            transition={{
              duration: 60,
              repeat: Infinity,
              ease: 'linear'
            }}
            className="absolute inset-0 flex"
            style={{ width: '400%' }}
          >
            {/* Image 1 - Drones */}
            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1920&q=90"
                alt="Professional drone technology"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 2 - Livestock */}
            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&q=90"
                alt="Cattle and livestock monitoring"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 3 - Wildlife */}
            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=1920&q=90"
                alt="Wildlife conservation"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 4 - Landscapes */}
            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1576704075965-5293c1c31916?w=1920&q=90"
                alt="Aerial landscape monitoring"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 5 - Farmers & Technology (Duplicate set for seamless loop) */}
            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee67e6f0c1e1?w=1920&q=90"
                alt="Farmers using technology"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Duplicate images for seamless loop */}
            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=1920&q=90"
                alt="Professional drone technology"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&q=90"
                alt="Cattle and livestock monitoring"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-1/4 h-full relative flex-shrink-0">
              <img
                src="https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=1920&q=90"
                alt="Wildlife conservation"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 z-20" />
        </div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-30 max-w-6xl mx-auto px-6 text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8 shadow-xl"
          >
            <Zap className="w-5 h-5 text-cyan-300" />
            <span className="text-white font-semibold text-sm">Africa's First Aerial Intelligence Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="text-white drop-shadow-2xl">Aerial Intelligence</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
              for Africa's Living Assets
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto font-light leading-relaxed"
          >
            Transform livestock, wildlife, and landscapes into monitored, predictable, and protected assets
            through cloud-powered drone intelligence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              href="/dashboard"
              className="group px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-glow-blue transition-all hover:scale-105 flex items-center gap-2"
            >
              View Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button className="group px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>

            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-2xl hover:shadow-glow-accent transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {[
              { value: '95%', label: 'Count Accuracy' },
              { value: '40%', label: 'Faster Detection' },
              { value: '50%', label: 'Loss Reduction' },
              { value: '24/7', label: 'Monitoring' },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {stat.value}
                </div>
                <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-primary-50 to-transparent rounded-bl-[100px] opacity-50" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-500 bg-clip-text text-transparent">
              Enterprise-Grade Capabilities
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by cutting-edge AI, cloud computing, and drone technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Activity,
                title: 'Real-Time Monitoring',
                description: 'Live tracking and instant alerts for all monitored assets',
                gradient: 'from-blue-500 to-cyan-500',
                delay: 0.1
              },
              {
                icon: Brain,
                title: 'AI Health Detection',
                description: 'Early disease detection and behavioral anomaly recognition',
                gradient: 'from-purple-500 to-pink-500',
                delay: 0.2
              },
              {
                icon: Shield,
                title: 'Anti-Theft & Security',
                description: 'Automated surveillance with night vision and intrusion detection',
                gradient: 'from-red-500 to-orange-500',
                delay: 0.3
              },
              {
                icon: Leaf,
                title: 'Pasture & Land Intelligence',
                description: 'Vegetation health, NDVI mapping, and degradation monitoring',
                gradient: 'from-green-500 to-emerald-500',
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                {/* Glassmorphism Card */}
                <div className="relative bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all h-full">
                  {/* Icon with Gradient Background */}
                  <div className={`w-16 h-16 mb-6 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - 4 Step Flow */}
      <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-500 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From sky to smartphone in four seamless steps
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 transform -translate-y-1/2 z-0" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  step: '01',
                  icon: Camera,
                  title: 'Drones',
                  description: 'Autonomous aerial patrols with RGB, thermal, and multispectral sensors',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  step: '02',
                  icon: Cpu,
                  title: 'Edge AI',
                  description: 'Real-time object detection, counting, and anomaly recognition at the edge',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  step: '03',
                  icon: Cloud,
                  title: 'Cloud',
                  description: 'Centralized database with analytics, insights, and predictive intelligence',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  step: '04',
                  icon: Smartphone,
                  title: 'Farmer/Ranger',
                  description: 'SMS alerts, mobile app, and web dashboard for instant actionable insights',
                  color: 'from-orange-500 to-red-500'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Card */}
                  <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all h-full">
                    {/* Step Number */}
                    <div className={`text-6xl font-bold mb-4 bg-gradient-to-br ${item.color} bg-clip-text text-transparent opacity-30`}>
                      {item.step}
                    </div>

                    {/* Icon */}
                    <div className={`w-20 h-20 mb-6 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <item.icon className="w-10 h-10 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Connection Dot */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-primary-500 rounded-full shadow-lg z-20" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Strip */}
      <section id="technology" className="py-16 bg-gradient-ocean relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IndoaXRlIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Powered By Enterprise Technology
            </h2>
            <p className="text-blue-100 text-lg">
              Built on world-class infrastructure and cutting-edge innovation
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { icon: Cloud, label: 'Huawei Cloud', color: 'from-red-400 to-red-600' },
              { icon: Brain, label: 'Deep Learning AI', color: 'from-purple-400 to-purple-600' },
              { icon: Camera, label: 'Drone Tech', color: 'from-blue-400 to-blue-600' },
              { icon: Server, label: 'Edge Computing', color: 'from-green-400 to-green-600' },
              { icon: Wifi, label: '4G/5G IoT', color: 'from-cyan-400 to-cyan-600' },
              { icon: Radio, label: 'Satellite Comms', color: 'from-orange-400 to-orange-600' }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${tech.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <tech.icon className="w-8 h-8 text-white" />
                </div>
                <span className="text-white text-sm font-semibold text-center">{tech.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-800 to-primary-500 bg-clip-text text-transparent">
              Built for Every Sector
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From smallholder farms to national parks and conservation areas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: TreePine,
                title: 'Commercial Farms',
                description: 'Large-scale livestock monitoring and ranch management',
                stats: '500+ Farms',
                gradient: 'from-green-500 to-emerald-600',
                image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&q=80'
              },
              {
                icon: Mountain,
                title: 'National Parks',
                description: 'Wildlife census and anti-poaching surveillance',
                stats: '12 Parks',
                gradient: 'from-blue-500 to-cyan-600',
                image: 'https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6?w=800&q=80'
              },
              {
                icon: Shield,
                title: 'Conservancies',
                description: 'Endangered species tracking and habitat monitoring',
                stats: '8 Reserves',
                gradient: 'from-purple-500 to-pink-600',
                image: 'https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=800&q=80'
              },
              {
                icon: Users,
                title: 'Tourism & Lodges',
                description: 'Guest safari experiences and wildlife viewing',
                stats: '20+ Lodges',
                gradient: 'from-orange-500 to-red-600',
                image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80'
              }
            ].map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all h-[400px]"
              >
                {/* Background Image */}
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${useCase.gradient} opacity-80 group-hover:opacity-90 transition-opacity`} />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-8 text-white z-10">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center mb-4">
                      <useCase.icon className="w-8 h-8" />
                    </div>
                    <div className="text-sm font-semibold bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-3 py-1 inline-block mb-3">
                      {useCase.stats}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{useCase.title}</h3>
                  <p className="text-white/90 leading-relaxed">{useCase.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-ocean relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Join the aerial intelligence revolution and protect what matters most
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="group px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-glow-blue transition-all hover:scale-105 flex items-center gap-2"
              >
                Explore Dashboard
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/register"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-ocean rounded-xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">KUBE</span>
                  <div className="text-xs text-gray-400">Aerial Intelligence Platform</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Transforming Africa's agriculture and conservation through AI-powered drone technology
                and cloud intelligence.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>Kigali, Rwanda • Pan-African Coverage</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024-2026 KUBE Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
