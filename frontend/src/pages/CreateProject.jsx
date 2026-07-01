import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Github, Linkedin, Upload, Plus, X } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Textarea } from '../components/ui/Textarea.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import oauthService from '../services/oauth.service.js';
import projectService from '../services/project.service.js';
import publishService from '../services/publish.service.js';

export const CreateProject = () => {
  const navigate = useNavigate();
  const [githubConnected, setGithubConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [repositories, setRepositories] = useState([]);
  const [fetchingRepos, setFetchingRepos] = useState(false);
  const [loading, setLoading] = useState(false);

  // File Upload State
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Tech Stack state
  const [techInput, setTechInput] = useState('');
  const [techStack, setTechStack] = useState([]);

  // Tag state
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      platforms: [],
    },
  });

  const selectedPlatforms = watch('platforms') || [];

  // Check account connection status on mount
  useEffect(() => {
    const checkConnections = async () => {
      try {
        const [ghRes, liRes] = await Promise.all([
          oauthService.getStatus('GITHUB'),
          oauthService.getStatus('LINKEDIN'),
        ]);

        const ghActive = ghRes.data.connected;
        const liActive = liRes.data.connected;

        setGithubConnected(ghActive);
        setLinkedinConnected(liActive);

        // Fetch repositories if GitHub is active
        if (ghActive) {
          setFetchingRepos(true);
          const repoRes = await oauthService.getRepositories();
          setRepositories(
            repoRes.data.repositories.map((r) => ({
              label: r.fullName,
              value: r.url,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load connections or repositories:', err);
      } finally {
        setFetchingRepos(false);
      }
    };

    checkConnections();
  }, []);

  // Handle Image Upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Tech Stack Handlers
  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (item) => {
    setTechStack(techStack.filter((t) => t !== item));
  };

  // Tags Handlers
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (item) => {
    setTags(tags.filter((t) => t !== item));
  };

  const onSubmit = async (data) => {
    if (techStack.length === 0) {
      toast.error('Please add at least one technology to the tech stack.');
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare Multipart Form Data
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('subtitle', data.subtitle || '');
      formData.append('description', data.description);
      formData.append('githubUrl', data.githubUrl || '');
      formData.append('demoUrl', data.demoUrl || '');
      formData.append('techStack', JSON.stringify(techStack));
      formData.append('tags', JSON.stringify(tags));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      // 2. Create Project
      const projectRes = await projectService.create(formData);
      const project = projectRes.data.project;

      toast.success('Project showcase saved successfully.');

      // 3. Trigger publishing if platforms are selected
      if (selectedPlatforms.length > 0) {
        toast.loading('Publishing to selected platforms...', { id: 'publish-toast' });
        await publishService.publish(project.id, selectedPlatforms);
        toast.success('Publishing process completed!', { id: 'publish-toast' });
      }

      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to save or publish project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50 font-display">Create Project Showcase</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Standardize your project metadata and select distribution targets.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6">
          {/* Main Details (Col span 2) */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="space-y-4 pt-4">
                <Input
                  label="Project Title *"
                  placeholder="e.g. Shift 9"
                  error={errors.title?.message}
                  {...register('title', { required: 'Title is required' })}
                />

                <Input
                  label="Subtitle"
                  placeholder="e.g. Developer Portfolio Automation Platform"
                  error={errors.subtitle?.message}
                  {...register('subtitle')}
                />

                <Textarea
                  label="Description *"
                  placeholder="Describe your project, the problem it solves, and its core features..."
                  error={errors.description?.message}
                  {...register('description', { required: 'Description is required' })}
                />
              </CardContent>
            </Card>

            {/* Links & Tech Stack */}
            <Card>
              <CardContent className="space-y-4 pt-4">
                {githubConnected ? (
                  <Select
                    label="Link GitHub Repository"
                    options={[{ label: 'Select a repository...', value: '' }, ...repositories]}
                    error={errors.githubUrl?.message}
                    {...register('githubUrl')}
                  />
                ) : (
                  <Input
                    label="GitHub Repository URL"
                    placeholder="https://github.com/username/repo"
                    error={errors.githubUrl?.message}
                    {...register('githubUrl')}
                  />
                )}

                <Input
                  label="Live Demo URL"
                  placeholder="https://yourproject.com"
                  error={errors.demoUrl?.message}
                  {...register('demoUrl')}
                />

                {/* Tech Stack Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 block">Tech Stack *</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. React"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTech();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTech}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                      >
                        {tech}
                        <button type="button" onClick={() => removeTech(tech)}>
                          <X className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags Input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 block">Tags / Hashtags</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. open-source"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300"
                      >
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)}>
                          <X className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (Upload + Targets) */}
          <div className="space-y-6">
            {/* Cover Image Upload */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cover Image</CardTitle>
                <CardDescription className="text-[10px]">JPEG, PNG, WebP up to 5MB.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 aspect-video">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-lg transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg aspect-video cursor-pointer hover:border-zinc-700 hover:bg-zinc-950/20 transition duration-150">
                    <Upload className="h-5 w-5 text-zinc-500 mb-1" />
                    <span className="text-xs text-zinc-400">Upload cover image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </CardContent>
            </Card>

            {/* Target Distribution Platforms */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Publish Targets</CardTitle>
                <CardDescription className="text-[10px]">Select platforms to distribute immediately.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className={`flex items-center justify-between p-3 border rounded-lg text-sm cursor-pointer transition ${
                  selectedPlatforms.includes('LINKEDIN')
                    ? 'border-zinc-500 bg-zinc-950/40'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <span className="flex items-center gap-2 text-zinc-200">
                    <Linkedin className="h-4 w-4 text-zinc-400" /> LinkedIn
                  </span>
                  <input
                    type="checkbox"
                    value="LINKEDIN"
                    disabled={!linkedinConnected}
                    className="rounded border-zinc-800 text-white focus:ring-0 cursor-pointer disabled:opacity-50"
                    {...register('platforms')}
                  />
                </label>

                <label className={`flex items-center justify-between p-3 border rounded-lg text-sm cursor-pointer transition ${
                  selectedPlatforms.includes('GITHUB')
                    ? 'border-zinc-500 bg-zinc-950/40'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}>
                  <span className="flex items-center gap-2 text-zinc-200">
                    <Github className="h-4 w-4 text-zinc-400" /> GitHub
                  </span>
                  <input
                    type="checkbox"
                    value="GITHUB"
                    disabled={!githubConnected}
                    className="rounded border-zinc-800 text-white focus:ring-0 cursor-pointer disabled:opacity-50"
                    {...register('platforms')}
                  />
                </label>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                {selectedPlatforms.length > 0 ? 'Publish Showcase' : 'Save Showcase'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
