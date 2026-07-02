import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Share2, Layers, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-black text-zinc-50 relative overflow-hidden">
      {/* Premium ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full bg-zinc-900/40 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-zinc-900/30 blur-[180px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <span className="text-xl font-bold tracking-tight font-display text-white">
          SHIFT <span className="text-zinc-500">94</span>
        </span>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="secondary" size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
            <CheckCircle className="h-3 w-3 text-emerald-500" /> Free Developer Portfolio Automation
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight leading-none text-white max-w-4xl mx-auto">
            Publish your project showcase. <br />
            <span className="text-zinc-500">Everywhere. Instantly.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-light">
            Create one professional project post and automate distribution across LinkedIn and GitHub from a single developer-centric dashboard.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Automating <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Star on GitHub
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="grid sm:grid-cols-3 gap-6 mt-32 text-left"
        >
          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl w-max mb-4">
              <Share2 className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-50 font-display mb-1">Multi-Channel Publish</h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Distribute rich media showcases and links to LinkedIn and GitHub concurrently with a single click.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl w-max mb-4">
              <Layers className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-50 font-display mb-1">Unified Showcase</h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Consolidate cover images, tech stacks, repositories, live URLs, and descriptions in a standardized format.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl w-max mb-4">
              <CheckCircle className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-50 font-display mb-1">Zero Cloud Cost</h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Designed to run 100% locally on your machine utilizing local PostgreSQL and image storage.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
