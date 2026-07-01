import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  CheckCircle,
  Linkedin,
  Github,
  ArrowRight,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import api from '../services/api.js';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      toast.success('Project deleted successfully.');
      setProjectToDelete(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete project.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/dashboard/recent-projects'),
      ]);
      setStats(statsRes.data);
      setRecent(recentRes.data.projects);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50 font-display">Dashboard Overview</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Track your publishing activity and connected developer accounts.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="self-start md:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" variant="rectangular" />
            ))
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
                  <CardTitle className="text-xs font-medium text-zinc-400">Total Projects</CardTitle>
                  <Layers className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-white">{stats?.totalProjects || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
                  <CardTitle className="text-xs font-medium text-zinc-400">Published Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold text-white">{stats?.publishedProjects || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
                  <CardTitle className="text-xs font-medium text-zinc-400">LinkedIn Status</CardTitle>
                  <Linkedin className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <Badge variant={stats?.linkedinConnected ? 'success' : 'info'}>
                    {stats?.linkedinConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
                  <CardTitle className="text-xs font-medium text-zinc-400">GitHub Status</CardTitle>
                  <Github className="h-4 w-4 text-zinc-500" />
                </CardHeader>
                <CardContent>
                  <Badge variant={stats?.githubConnected ? 'success' : 'info'}>
                    {stats?.githubConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Sections (Recent Projects / Quick Actions) */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Projects Showcase */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-display">
              Recent Projects
            </h2>

            {loading ? (
              <Skeleton className="h-64 rounded-2xl" variant="rectangular" />
            ) : recent.length === 0 ? (
              <Card className="flex flex-col items-center justify-center text-center py-12">
                <p className="text-xs text-zinc-400 mb-4">No projects created yet.</p>
                <Link to="/projects/create">
                  <Button variant="secondary" size="sm">
                    Create a Project
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {recent.map((project) => (
                  <Card
                    key={project.id}
                    className="flex items-center justify-between gap-4 p-4 hover:border-zinc-700 transition duration-150"
                  >
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-semibold text-white truncate">{project.title}</h3>
                      {project.subtitle && (
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{project.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={project.status === 'PUBLISHED' ? 'success' : 'info'}>
                        {project.status}
                      </Badge>
                      <Link to={`/projects/edit/${project.id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProjectToDelete(project)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider font-display">
              Quick Actions
            </h2>
            <Card className="space-y-4">
              <Link to="/projects/create" className="block">
                <Button variant="primary" className="w-full justify-between">
                  Create New Showcase <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/settings" className="block">
                <Button variant="secondary" className="w-full">
                  Manage Integrations
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md animate-scale-in">
            <h3 className="text-lg font-semibold text-white font-display">Delete Project?</h3>
            <p className="text-xs text-zinc-400 mt-2">
              Are you sure you want to delete <span className="font-semibold text-zinc-200">"{projectToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setProjectToDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="bg-red-600 hover:bg-red-700 text-white border-none hover:text-white"
                onClick={handleDeleteProject}
                loading={deleteLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
